import { describe, it, expect } from 'vitest';
import path from 'path';
import { executeFfmpegRender } from '../server/rendering/ffmpegRenderer';
import { validateVideoFile } from '../server/rendering/videoValidator';

describe('FFmpeg 9:16 Video Renderer', () => {
  it('renders a real 9:16 MP4 video and validates with ffprobe', async () => {
    const sampleDir = path.resolve(process.cwd(), 'public/samples');
    const result = await executeFfmpegRender({
      jobId: 'test-unit-render',
      width: 1080,
      height: 1920,
      fps: 30,
      scenes: [
        {
          imagePath: path.join(sampleDir, 'images/sample1.jpg'),
          durationSec: 2.0,
          caption: 'The Glass Pavilion'
        },
        {
          imagePath: path.join(sampleDir, 'images/sample2.jpg'),
          durationSec: 2.0,
          caption: 'Great Room Sanctuary'
        }
      ],
      audioFilePath: path.join(sampleDir, 'audio/test_audio.mp3'),
      aspectRatio: '9:16'
    });

    expect(result.outputPath).toBeDefined();

    const probe = await validateVideoFile(result.outputPath);
    expect(probe.isValid).toBe(true);
    expect(probe.width).toBe(1080);
    expect(probe.height).toBe(1920);
    expect(probe.hasAudio).toBe(true);
    expect(probe.duration).toBeGreaterThan(3.0);
  }, 40000);

  it('renders a real 9:16 MP4 video without audio (silent optional audio mode)', async () => {
    const sampleDir = path.resolve(process.cwd(), 'public/samples');
    const result = await executeFfmpegRender({
      jobId: 'test-silent-render',
      width: 1080,
      height: 1920,
      fps: 30,
      scenes: [
        {
          imagePath: path.join(sampleDir, 'images/sample1.jpg'),
          durationSec: 3.5,
          caption: 'Silent Architecture Preview'
        },
        {
          imagePath: path.join(sampleDir, 'images/sample2.jpg'),
          durationSec: 3.5,
          caption: 'Pure Visual Showcase'
        }
      ],
      aspectRatio: '9:16'
    });

    expect(result.outputPath).toBeDefined();

    const probe = await validateVideoFile(result.outputPath);
    expect(probe.isValid).toBe(true);
    expect(probe.width).toBe(1080);
    expect(probe.height).toBe(1920);
    expect(probe.duration).toBeCloseTo(7.0, 0.5);
  }, 40000);
});

