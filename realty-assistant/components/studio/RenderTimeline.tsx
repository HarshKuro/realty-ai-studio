'use client';

import React, { useState, useEffect } from 'react';
import { PlannedScene } from '@/lib/story/scenePlanner';
import { Loader2, CheckCircle2, Film, AlertCircle, RefreshCw } from 'lucide-react';

interface RenderTimelineProps {
  scenes: PlannedScene[];
  audioInfo: { url: string; filePath: string; durationSec: number };
  onRenderComplete: (video: { url: string; path: string; durationSec: number }) => void;
  onBack: () => void;
}

const STAGES = [
  { key: 'PREPARING_ASSETS', label: 'Preparing Photographic Plates' },
  { key: 'RENDERING_VIDEO', label: 'FFmpeg 9:16 Compositing & Subtitles' },
  { key: 'VALIDATING_EXPORT', label: 'FFprobe Stream & Codec Verification' },
  { key: 'COMPLETED', label: 'Video Export Verified' },
];

export const RenderTimeline: React.FC<RenderTimelineProps> = ({
  scenes,
  audioInfo,
  onRenderComplete,
  onBack,
}) => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<string>('IDLE');
  const [statusMessage, setStatusMessage] = useState<string>('Initializing render...');
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  const startRender = async () => {
    setIsRendering(true);
    setError(null);
    setCurrentStage('PREPARING_ASSETS');
    setStatusMessage('Initiating FFmpeg render pipeline...');

    try {
      const res = await fetch('/api/render/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes: scenes.map((s) => ({
            imageUrl: s.image.url,
            imagePath: s.image.filePath,
            caption: s.caption,
          })),
          audioFilePath: audioInfo.filePath,
          audioDurationSec: audioInfo.durationSec,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start video render');
      }

      setJobId(data.jobId);
    } catch (err: any) {
      setError(err.message || 'Render initiation failed');
      setIsRendering(false);
      setCurrentStage('FAILED');
    }
  };

  useEffect(() => {
    if (!jobId || !isRendering) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/render/status/${jobId}`);
        const data = await res.json();
        if (data.job) {
          setCurrentStage(data.job.stage);
          setStatusMessage(data.job.message);

          if (data.job.stage === 'COMPLETED') {
            setIsRendering(false);
            clearInterval(interval);
            onRenderComplete({
              url: data.job.videoUrl,
              path: data.job.videoPath,
              durationSec: data.job.durationSec,
            });
          } else if (data.job.stage === 'FAILED') {
            setIsRendering(false);
            setError(data.job.error || 'Video rendering failed');
            clearInterval(interval);
          }
        }
      } catch (err: any) {
        console.error('Status polling error:', err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [jobId, isRendering, onRenderComplete]);

  // Auto-start render when tab mounts
  useEffect(() => {
    if (!jobId && !isRendering && currentStage === 'IDLE') {
      startRender();
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">Video Rendering Engine</h2>
          <p className="text-xs text-zinc-400">
            Compositing 9:16 vertical resolution (1080x1920 @ 30fps), H.264 video, AAC master audio, and burned-in subtitles.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-900/60 rounded-md text-red-300 text-xs flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
            <div>
              <div className="font-semibold text-sm">Rendering Stopped</div>
              <div>{error}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={startRender}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-900/60 hover:bg-red-800 text-white rounded text-xs font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Render
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs transition-colors"
            >
              Return to Voice Studio
            </button>
          </div>
        </div>
      )}

      {/* Render Pipeline Stages Card */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-semibold text-white">Truthful Export Progress</span>
          </div>
          <span className="text-xs font-mono text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800">
            {currentStage}
          </span>
        </div>

        {/* Pipeline Stepper */}
        <div className="space-y-4">
          {STAGES.map((stg, i) => {
            const isFinished =
              currentStage === 'COMPLETED' ||
              (currentStage === 'VALIDATING_EXPORT' && i < 2) ||
              (currentStage === 'RENDERING_VIDEO' && i < 1);
            const isCurrent = currentStage === stg.key;

            return (
              <div
                key={stg.key}
                className={`p-3.5 rounded border transition-colors flex items-center justify-between ${
                  isFinished
                    ? 'bg-zinc-900/80 border-emerald-900/40 text-emerald-300'
                    : isCurrent
                    ? 'bg-blue-950/30 border-blue-800/60 text-blue-200'
                    : 'bg-zinc-950/40 border-zinc-900 text-zinc-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isFinished ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-zinc-700 flex-shrink-0" />
                  )}
                  <span className="text-xs font-medium">{stg.label}</span>
                </div>
                {isCurrent && (
                  <span className="text-[11px] text-blue-400 font-mono animate-pulse">
                    Processing
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
          <span>Active Pipeline Message:</span>
          <span className="text-zinc-200 font-mono text-[11px]">{statusMessage}</span>
        </div>
      </div>
    </div>
  );
};
