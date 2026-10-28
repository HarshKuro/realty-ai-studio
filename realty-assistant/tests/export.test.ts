import { describe, it, expect } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import { validateVideoFile } from '../server/rendering/videoValidator';

describe('Video Export & Delivery Route', () => {
  it('validates generated export MP4 on disk is playable and has headers', async () => {
    const videoDir = path.resolve(process.cwd(), 'public/renders/videos');
    await fs.mkdir(videoDir, { recursive: true });

    // Use test render file from task 5
    const testVideoPath = path.join(videoDir, 'test-unit-render.mp4');
    const exists = await fs
      .stat(testVideoPath)
      .then(() => true)
      .catch(() => false);

    expect(exists).toBe(true);

    const probe = await validateVideoFile(testVideoPath);
    expect(probe.isValid).toBe(true);
    expect(probe.hasAudio).toBe(true);
    expect(probe.width).toBe(1080);
    expect(probe.height).toBe(1920);
  });
});
