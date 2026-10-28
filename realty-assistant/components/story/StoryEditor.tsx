'use client';

import React from 'react';
import { PlannedScene } from '@/lib/story/scenePlanner';
import { Clock, Edit3, ArrowRight, RefreshCw, FileText } from 'lucide-react';

interface StoryEditorProps {
  fullNarration: string;
  scenes: PlannedScene[];
  estimatedTotalDurationSec: number;
  onNarrationChange: (text: string) => void;
  onSceneChange: (sceneIndex: number, caption: string, narration: string) => void;
  onRegenerate: () => void;
  onContinue: () => void;
}

export const StoryEditor: React.FC<StoryEditorProps> = ({
  fullNarration,
  scenes,
  estimatedTotalDurationSec,
  onNarrationChange,
  onSceneChange,
  onRegenerate,
  onContinue,
}) => {
  const wordCount = fullNarration.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">Factual Story & Captions</h2>
          <p className="text-xs text-zinc-400">
            Review and refine the factual script and on-screen scene captions before synthesizing narration.
          </p>
        </div>
        <button
          type="button"
          onClick={onRegenerate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset to Baseline
        </button>
      </div>

      {/* Script Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-md">
          <div className="text-[11px] text-zinc-400 font-medium">ESTIMATED AUDIO LENGTH</div>
          <div className="text-base font-semibold text-white flex items-center gap-1.5 mt-0.5">
            <Clock className="w-4 h-4 text-blue-500" />
            {estimatedTotalDurationSec.toFixed(1)}s
          </div>
        </div>

        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-md">
          <div className="text-[11px] text-zinc-400 font-medium">TOTAL WORD COUNT</div>
          <div className="text-base font-semibold text-white flex items-center gap-1.5 mt-0.5">
            <FileText className="w-4 h-4 text-blue-500" />
            {wordCount} words
          </div>
        </div>

        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-md col-span-2 sm:col-span-1">
          <div className="text-[11px] text-zinc-400 font-medium">VIDEO TIMELINE SCENES</div>
          <div className="text-base font-semibold text-white flex items-center gap-1.5 mt-0.5">
            <Edit3 className="w-4 h-4 text-blue-500" />
            {scenes.length} Scenes
          </div>
        </div>
      </div>

      {/* Complete Voice-Over Script Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-300">Complete Narration Voice-Over Script</label>
          <span className="text-[11px] text-zinc-500">Sent directly to local Kokoro TTS</span>
        </div>
        <textarea
          rows={4}
          value={fullNarration}
          onChange={(e) => onNarrationChange(e.target.value)}
          className="w-full p-3 text-sm bg-zinc-900/90 border border-zinc-800 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors leading-relaxed"
          placeholder="Complete voice-over script..."
        />
      </div>

      {/* Per-Scene Breakdown */}
      <div className="space-y-4">
        <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          Scene Captions & Visual Mapping
        </div>

        <div className="space-y-3">
          {scenes.map((scene, idx) => {
            const charCount = scene.caption.length;
            const isTooLong = charCount > 65;

            return (
              <div
                key={scene.id}
                className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-md flex flex-col md:flex-row gap-4 items-start"
              >
                {/* Scene thumbnail */}
                <div className="relative w-24 aspect-[9/12] flex-shrink-0 bg-zinc-950 rounded overflow-hidden border border-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={scene.image.url}
                    alt={scene.caption}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/80 text-[10px] font-mono text-white rounded">
                    S0{idx + 1}
                  </div>
                </div>

                {/* Editable caption and segment narration */}
                <div className="flex-1 space-y-2.5 w-full">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-zinc-400">
                        Burned-in Video Caption (9:16 safe area)
                      </label>
                      <span className={`text-[10px] font-mono ${isTooLong ? 'text-amber-400 font-semibold' : 'text-zinc-500'}`}>
                        {charCount}/65 max chars
                      </span>
                    </div>
                    <input
                      type="text"
                      value={scene.caption}
                      maxLength={70}
                      onChange={(e) => onSceneChange(idx, e.target.value, scene.narration)}
                      className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-blue-500 font-medium"
                      placeholder="Concise caption overlay on video"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 mb-1 block">
                      Scene Narration Segment
                    </label>
                    <input
                      type="text"
                      value={scene.narration}
                      onChange={(e) => onSceneChange(idx, scene.caption, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-blue-500"
                      placeholder="Audio spoken during this scene"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
        >
          Approve Story & Proceed to Voice Studio
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
