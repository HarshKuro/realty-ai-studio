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

    const jobId = crypto.randomUUID();
    jobTracker.set(jobId, {
      stage: 'PREPARING_ASSETS',
      message: 'Preparing photographic plates and scene parameters',
    });

    // Audio is optional: if audioDurationSec is provided, match it; otherwise use clean 3.5s per scene default
    const perSceneDur = audioDurationSec && Number(audioDurationSec) > 0
      ? Math.max(1.5, Number(audioDurationSec) / scenes.length)
      : 3.5;

    // Map scenes with absolute file paths
    const formattedScenes = scenes.map((s: any) => {
      let resolvedImagePath = s.imagePath;
      if (!resolvedImagePath && s.imageUrl) {
        resolvedImagePath = path.resolve(process.cwd(), 'public', s.imageUrl.replace(/^\//, ''));
      }
      return {
        imagePath: resolvedImagePath,
        durationSec: Number(s.durationSec) || perSceneDur,
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
          audioFilePath: audioFilePath || undefined,
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

