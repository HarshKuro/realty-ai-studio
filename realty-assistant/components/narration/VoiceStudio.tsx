'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, Play, Pause, Loader2, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

interface VoiceStudioProps {
  script: string;
  onAudioReady: (audio: { url: string; filePath: string; durationSec: number }) => void;
  onContinue: () => void;
}

export const VoiceStudio: React.FC<VoiceStudioProps> = ({
  script,
  onAudioReady,
  onContinue,
}) => {
  const [voices, setVoices] = useState<any[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('af_heart');
  const [speed, setSpeed] = useState(1.0);
  const [loadingVoices, setLoadingVoices] = useState(true);
  const [synthesizing, setSynthesizing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadVoices() {
      try {
        setLoadingVoices(true);
        const res = await fetch('/api/tts/voices');
        const data = await res.json();
        if (data.voices && data.voices.length > 0) {
          setVoices(data.voices);
          if (data.defaultVoice) {
            setSelectedVoice(data.defaultVoice);
          }
        } else if (data.error) {
          setError(data.error);
        }
      } catch (err: any) {
        setError(`Kokoro TTS service connection failed: ${err.message}`);
      } finally {
        setLoadingVoices(false);
      }
    }
    loadVoices();
  }, []);

  const handleSynthesize = async () => {
    if (!script.trim()) {
      setError('Script cannot be empty');
      return;
    }

    setSynthesizing(true);
    setError(null);

    try {
      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: script,
          voice: selectedVoice,
          speed,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate voice audio');
      }

      setAudioUrl(data.audioUrl);
      setAudioDuration(data.durationSec);
      onAudioReady({
        url: data.audioUrl,
        filePath: data.audioFilePath,
        durationSec: data.durationSec,
      });

      const audio = new Audio(data.audioUrl);
      audio.onended = () => setIsPlaying(false);
      setAudioElement(audio);
    } catch (err: any) {
      setError(err.message || 'Voice generation failed');
    } finally {
      setSynthesizing(false);
    }
  };

  const togglePlayAudio = () => {
    if (!audioElement) return;
    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">Voice & Narration Studio</h2>
          <p className="text-xs text-zinc-400">
            Powered by local Kokoro TTS GPU container. Select an ultra-realistic voice model and generate your master audio track.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-md text-red-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
          <div>
            <div className="font-semibold">Voice Generation Notice</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Voice Selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-300">Narration Voice Artist</label>
          {loadingVoices ? (
            <div className="h-10 bg-zinc-900 rounded border border-zinc-800 animate-pulse" />
          ) : (
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-md text-white focus:outline-none focus:border-blue-500 font-medium"
            >
              {voices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} {v.overall_grade ? `(Grade ${v.overall_grade})` : ''} {v.id === 'af_heart' ? '★ Recommended' : ''}
                </option>
              ))}
            </select>
          )}
          <div className="text-[11px] text-zinc-500">
            Selected voice: <span className="text-blue-400 font-mono">{selectedVoice}</span> (8880/v1 local endpoint)
          </div>
        </div>

        {/* Speed Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-zinc-300">Pacing / Speed Rate</label>
            <span className="text-xs font-mono text-zinc-400">{speed.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.2"
            step="0.05"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full accent-blue-600 bg-zinc-800 h-2 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>0.80x (Deliberate)</span>
            <span>1.00x (Standard)</span>
            <span>1.20x (Brisk)</span>
          </div>
        </div>
      </div>

      {/* Generation Control */}
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-white">Generate Narration Track</div>
          <div className="text-[11px] text-zinc-400">
            Synthesizes {script.trim().split(/\s+/).filter(Boolean).length} words into high-fidelity MP3.
          </div>
        </div>

        <button
          type="button"
          disabled={synthesizing || !script.trim()}
          onClick={handleSynthesize}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors disabled:opacity-50"
        >
          {synthesizing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Synthesizing Audio...
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              Synthesize Narration Audio
            </>
          )}
        </button>
      </div>

      {/* Audio Playback Card */}
      {audioUrl && (
        <div className="p-4 bg-zinc-900/90 border border-blue-900/40 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-white">Narration Track Ready</span>
            </div>
            {audioDuration && (
              <span className="text-xs font-mono text-blue-400">
                Duration: {audioDuration.toFixed(1)}s
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlayAudio}
              className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors flex items-center justify-center"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div className="flex-1">
              <audio
                src={audioUrl}
                controls
                className="w-full h-8 brightness-90 contrast-125"
              />
            </div>
          </div>
        </div>
      )}

      <div className="pt-4 flex justify-end">
        <button
          type="button"
          disabled={!audioUrl}
          onClick={onContinue}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Approve Audio & Proceed to Render Engine
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
