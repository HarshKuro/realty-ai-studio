import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import path from 'path';
import { executeFfmpegRender } from '@/server/rendering/ffmpegRenderer';
import { validateVideoFile } from '@/server/rendering/videoValidator';
import { jobTracker } from '@/server/rendering/jobTracker';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scenes, audioFilePath, audioDurationSec } = body;

    if (!Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json({ error: 'Scenes array is required' }, { status: 400 });
    }

    if (!audioFilePath) {
      return NextResponse.json({ error: 'Audio narration path is required' }, { status: 400 });
    }

    const jobId = crypto.randomUUID();
    jobTracker.set(jobId, {
      stage: 'PREPARING_ASSETS',
      message: 'Preparing photographic plates and scene parameters',
    });

    // Calculate per-scene duration matching total audio duration
    const totalAudioDur = Math.max(3.0, Number(audioDurationSec) || 15.0);
    const perSceneDur = Math.max(1.5, totalAudioDur / scenes.length);

    // Map scenes with absolute file paths
    const formattedScenes = scenes.map((s: any) => {
      let resolvedImagePath = s.imagePath;
      if (!resolvedImagePath && s.imageUrl) {
        resolvedImagePath = path.resolve(process.cwd(), 'public', s.imageUrl.replace(/^\//, ''));
      }
      return {
        imagePath: resolvedImagePath,
        durationSec: perSceneDur,
        caption: s.caption || '',
      };
    });

    // Start background render worker
    (async () => {
      try {
        jobTracker.set(jobId, {
          stage: 'RENDERING_VIDEO',
          message: 'Rendering 9:16 vertical video & burning captions via FFmpeg',
        });

        const renderResult = await executeFfmpegRender({
          jobId,
          width: 1080,
          height: 1920,
          fps: 30,
          scenes: formattedScenes,
          audioFilePath,
          aspectRatio: '9:16',
        });

        jobTracker.set(jobId, {
          stage: 'VALIDATING_EXPORT',
          message: 'Running FFprobe stream, codec, and duration verification',
        });

        const probe = await validateVideoFile(renderResult.outputPath);
        if (!probe.isValid) {
          throw new Error(`Export validation failed: ${probe.error}`);
        }

        jobTracker.set(jobId, {
          stage: 'COMPLETED',
          message: 'Real 9:16 MP4 video export verified and ready',
          videoUrl: renderResult.publicUrl,
          videoPath: renderResult.outputPath,
          durationSec: probe.duration,
        });
      } catch (err: any) {
        console.error(`Render job ${jobId} failed:`, err);
        jobTracker.fail(jobId, err.message || 'Video rendering failed');
      }
    })();

    return NextResponse.json({ success: true, jobId });
  } catch (error: any) {
    console.error('Render start error:', error);
    return NextResponse.json({ error: error.message || 'Failed to start render' }, { status: 500 });
  }
}
