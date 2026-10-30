'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, Loader2, ArrowRight, CheckCircle, Upload, Music, VolumeX, Info } from 'lucide-react';

interface VoiceStudioProps {
  script: string;
  onAudioReady: (audio: { url: string; filePath: string; durationSec: number }) => void;
  onContinue: () => void;
  onSkipAudio: () => void;
}

export const VoiceStudio: React.FC<VoiceStudioProps> = ({
  script,
  onAudioReady,
  onContinue,
  onSkipAudio,
}) => {
  const [voices, setVoices] = useState<any[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('af_heart');
  const [speed, setSpeed] = useState(1.0);
  const [loadingVoices, setLoadingVoices] = useState(true);
  const [synthesizing, setSynthesizing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [audioLabel, setAudioLabel] = useState<string>('Narration Track');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
        }
        if (data.isOffline) {
          setIsOffline(true);
        }
      } catch (err: any) {
        setIsOffline(true);
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
        throw new Error(data.error || 'Failed to connect to Kokoro TTS service. Ensure Kokoro is running locally, or skip audio.');
      }

      setAudioUrl(data.audioUrl);
      setAudioDuration(data.durationSec);
      setAudioLabel(`Synthesized (${selectedVoice})`);
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

  const handleLoadSampleAudio = () => {
    const sample = {
      url: '/samples/audio/test_audio.mp3',
      filePath: 'public/samples/audio/test_audio.mp3',
      durationSec: 4.8,
    };
    setAudioUrl(sample.url);
    setAudioDuration(sample.durationSec);
    setAudioLabel('Sample Studio Narration (Demo)');
    onAudioReady(sample);

    const audio = new Audio(sample.url);
    audio.onended = () => setIsPlaying(false);
    setAudioElement(audio);
    setError(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/audio/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload audio file');
      }

      setAudioUrl(data.audioUrl);
      setAudioDuration(data.durationSec);
      setAudioLabel(`Uploaded: ${data.fileName}`);
      onAudioReady({
        url: data.audioUrl,
        filePath: data.audioFilePath,
        durationSec: data.durationSec,
      });

      const audio = new Audio(data.audioUrl);
      audio.onended = () => setIsPlaying(false);
      setAudioElement(audio);
    } catch (err: any) {
      setError(err.message || 'Audio upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-white">Voice & Narration Studio</h2>
            <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              Optional
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Audio narration is completely optional. You can render a silent 9:16 video with visual captions (3.5s per plate), upload custom voiceover, or synthesize with local Kokoro.
          </p>
        </div>

        <button
          type="button"
          onClick={onSkipAudio}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 hover:border-zinc-700 rounded-md transition-colors self-start sm:self-auto"
        >
          <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
          Skip & Render Silent Video
        </button>
      </div>

      {/* Offline Guidance Callout */}
      {isOffline && (
        <div className="p-4 bg-zinc-900/90 border border-blue-900/50 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs font-semibold text-white">Zero-Docker Mode • Audio is Optional</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Local Kokoro TTS service is offline (Docker is not required). You can render a silent video with on-screen visual captions (3.5s per scene), load sample audio, or upload a pre-recorded audio track.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onSkipAudio}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors whitespace-nowrap"
          >
            Render Silent Video (3.5s/scene) →
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-md text-red-300 text-xs flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
          <div>
            <div className="font-semibold">Notice</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Options Grid: Synthesize, Upload Custom Audio, or Sample Demo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kokoro Local Synthesizer Box */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-blue-400" />
              Kokoro TTS Synthesizer
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              {isOffline ? 'Service Offline' : 'Local 8880/v1'}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-zinc-400 block mb-1">Voice Artist</label>
              {loadingVoices ? (
                <div className="h-9 bg-zinc-950 rounded border border-zinc-800 animate-pulse" />
              ) : (
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  {voices.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-medium text-zinc-400">Pacing Speed</label>
                <span className="text-[11px] font-mono text-zinc-400">{speed.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.2"
                step="0.05"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-blue-600 bg-zinc-800 h-1.5 rounded cursor-pointer"
              />
            </div>

            <button
              type="button"
              disabled={synthesizing || !script.trim()}
              onClick={handleSynthesize}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors disabled:opacity-40"
            >
              {synthesizing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Synthesizing Speech...
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  Synthesize Narration Track
                </>
              )}
            </button>
          </div>
        </div>

        {/* Alternative Audio: Upload Custom Audio or 1-Click Demo */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Music className="w-4 h-4 text-emerald-400" />
              Custom Voiceover or Demo Audio
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Want audio without Kokoro? Upload your own recorded voiceover (.mp3 or .wav), or load the bundled sample audio.
            </p>
          </div>

          <div className="space-y-2.5">
            <input
              type="file"
              ref={fileInputRef}
              accept="audio/mp3,audio/wav,audio/mpeg,audio/m4a"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-zinc-200 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded transition-colors"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Processing Audio...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-zinc-400" />
                  Upload Custom Voiceover (.mp3 / .wav)
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleLoadSampleAudio}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-850 rounded transition-colors"
            >
              <Music className="w-3.5 h-3.5" />
              1-Click Load Beverly Hills Sample Audio
            </button>
          </div>
        </div>
      </div>

      {/* Audio Playback Card */}
      {audioUrl && (
        <div className="p-4 bg-zinc-900/90 border border-blue-900/40 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-white">{audioLabel} Ready</span>
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

      {/* Footer Navigation */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800">
        <button
          type="button"
          onClick={onSkipAudio}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
        >
          <VolumeX className="w-4 h-4 text-zinc-400" />
          Proceed Without Audio (Silent Video)
        </button>

        <button
          type="button"
          disabled={!audioUrl}
          onClick={onContinue}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Approve Audio & Proceed to Render Engine
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
