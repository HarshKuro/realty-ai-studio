'use client';

import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, X, Check, AlertCircle } from 'lucide-react';
import { PropertyDetails } from '@/lib/validation/property';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (extractedData: Partial<PropertyDetails>) => void;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSec, setRecordingSec] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  if (!isOpen) return null;

  const startRecording = async () => {
    setError(null);
    setTranscript('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await handleTranscribe(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSec(0);

      timerRef.current = setInterval(() => {
        setRecordingSec((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setError(`Microphone access error: ${err.message || 'Permission denied'}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleTranscribe = async (audioBlob: Blob) => {
    setTranscribing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav');

      const res = await fetch('/api/stt/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Transcription failed');
      }

      setTranscript(data.text);
    } catch (err: any) {
      setError(err.message || 'Speech recognition failed');
    } finally {
      setTranscribing(false);
    }
  };

  const parseTranscriptToFields = () => {
    if (!transcript.trim()) return;

    // Simple robust keyword parsing
    const lines = transcript.split(/[.\n]+/).map((l) => l.trim()).filter(Boolean);
    const updates: Partial<PropertyDetails> = {
      features: [],
    };

    const textLower = transcript.toLowerCase();

    // Check title or use first sentence
    if (lines.length > 0) {
      updates.title = lines[0];
    }

    // Try price detection ($X or X million)
    const priceMatch = transcript.match(/\$[\d,]+(\.\d+)?|\b\d+(\.\d+)?\s*(million|k)\b/i);
    if (priceMatch) {
      updates.price = priceMatch[0];
    }

    // Try bedroom detection
    const bedMatch = textLower.match(/(\d+)\s*(bed|bedroom|br)/);
    if (bedMatch) {
      updates.bedrooms = parseInt(bedMatch[1], 10);
    }

    // Try bathroom detection
    const bathMatch = textLower.match(/(\d+(\.\d+)?)\s*(bath|bathroom|ba)/);
    if (bathMatch) {
      updates.bathrooms = parseFloat(bathMatch[1]);
    }

    // Features: remaining lines
    if (lines.length > 1) {
      updates.features = lines.slice(1, 4);
    }

    onApply(updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-lg w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-white">Voice Dictation (Faster Whisper)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-900/60 rounded text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="text-xs text-zinc-400">
          Speak property highlights (e.g. &quot;Modern glass villa in Malibu. Asking 4.5 million. 4 bedrooms, infinity pool and panoramic ocean views.&quot;).
        </div>

        {/* Recording Controls */}
        <div className="flex flex-col items-center justify-center py-6 bg-zinc-950 border border-zinc-800/80 rounded-lg space-y-3">
          {isRecording ? (
            <button
              type="button"
              onClick={stopRecording}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 animate-pulse"
            >
              <Square className="w-6 h-6 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              disabled={transcribing}
              onClick={startRecording}
              className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
            >
              {transcribing ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>
          )}

          <div className="text-xs font-mono text-zinc-300">
            {isRecording
              ? `Recording... ${recordingSec}s (Click square to finish)`
              : transcribing
              ? 'Transcribing via Whisper 8881/v1...'
              : 'Click microphone to start recording'}
          </div>
        </div>

        {/* Transcript Review */}
        {transcript && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-medium">Recognized Transcription (Editable Review):</span>
            </div>
            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!transcript.trim()}
            onClick={parseTranscriptToFields}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors disabled:opacity-40"
          >
            <Check className="w-3.5 h-3.5" />
            Apply Spoken Details
          </button>
        </div>
      </div>
    </div>
  );
};
