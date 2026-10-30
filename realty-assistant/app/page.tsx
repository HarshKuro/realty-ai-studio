'use client';

import React, { useState } from 'react';
import { PropertyForm } from '@/components/property/PropertyForm';
import { ImageUploader } from '@/components/media/ImageUploader';
import { StoryEditor } from '@/components/story/StoryEditor';
import { VoiceStudio } from '@/components/narration/VoiceStudio';
import { RenderTimeline } from '@/components/studio/RenderTimeline';
import { ExportStudio } from '@/components/export/ExportStudio';
import { PropertyDetails } from '@/lib/validation/property';
import { ImageItem } from '@/lib/validation/media';
import { VideoScript, generateFactualScript } from '@/lib/story/scriptGenerator';
import { PlannedScene, alignScenesWithImages } from '@/lib/story/scenePlanner';
import { Building2, Image as ImageIcon, BookOpen, Volume2, Film, Check } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Property Facts', icon: Building2 },
  { id: 2, label: 'Photos (4–8)', icon: ImageIcon },
  { id: 3, label: 'Story & Captions', icon: BookOpen },
  { id: 4, label: 'Voice Studio (Optional)', icon: Volume2 },
  { id: 5, label: 'Render & Export', icon: Film },
];

export default function StudioPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // State across workflow
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [script, setScript] = useState<VideoScript | null>(null);
  const [scenes, setScenes] = useState<PlannedScene[]>([]);
  const [audioInfo, setAudioInfo] = useState<{ url: string; filePath: string; durationSec: number } | null>(null);
  const [videoInfo, setVideoInfo] = useState<{ url: string; path: string; durationSec: number } | null>(null);

  // 1-Click Load Sample Property Data
  const handleLoadSampleProperty = async () => {
    try {
      const res = await fetch('/samples/property.json');
      const data = await res.json();
      setProperty(data);
    } catch (err) {
      console.error('Failed to load sample property:', err);
    }
  };

  // 1-Click Load 5 Sample Images
  const handleLoadSampleImages = () => {
    const samples: ImageItem[] = [
      { id: 'sample-1', name: 'Grand Foyer', url: '/samples/images/sample1.jpg', size: 18000, type: 'image/jpeg' },
      { id: 'sample-2', name: 'Great Room', url: '/samples/images/sample2.jpg', size: 18000, type: 'image/jpeg' },
      { id: 'sample-3', name: 'Boffi Kitchen', url: '/samples/images/sample3.jpg', size: 18000, type: 'image/jpeg' },
      { id: 'sample-4', name: 'Primary Suite', url: '/samples/images/sample4.jpg', size: 18000, type: 'image/jpeg' },
      { id: 'sample-5', name: 'Skyline Terrace', url: '/samples/images/sample5.jpg', size: 18000, type: 'image/jpeg' },
    ];
    setImages(samples);
  };

  // Step 1: Submit Property Details
  const handlePropertySubmit = (details: PropertyDetails) => {
    setProperty(details);
    markStepComplete(1);
    setCurrentStep(2);
  };

  // Step 2: Confirm Images and Generate Script
  const handleImagesConfirm = () => {
    if (!property || images.length < 4 || images.length > 8) return;

    // Generate factual deterministic script based on real facts & image count
    const generated = generateFactualScript(property, images.length);
    setScript(generated);

    const aligned = alignScenesWithImages(generated.scenes, images);
    setScenes(aligned);

    markStepComplete(2);
    setCurrentStep(3);
  };

  // Step 3: Script & Captions Edits
  const handleNarrationChange = (text: string) => {
    if (!script) return;
    setScript({ ...script, fullNarration: text });
  };

  const handleSceneChange = (sceneIndex: number, caption: string, narration: string) => {
    setScenes((prev) =>
      prev.map((s, idx) => (idx === sceneIndex ? { ...s, caption, narration } : s))
    );
  };

  const handleRegenerateScript = () => {
    if (!property) return;
    const generated = generateFactualScript(property, images.length || 5);
    setScript(generated);
    setScenes(alignScenesWithImages(generated.scenes, images));
  };

  const handleScriptApprove = () => {
    markStepComplete(3);
    setCurrentStep(4);
  };

  // Step 3: Direct Skip to Silent Render (Audio completely optional)
  const handleSkipToRender = () => {
    setAudioInfo(null);
    markStepComplete(3);
    markStepComplete(4);
    setCurrentStep(5);
  };

  // Step 4: Voice Studio Audio Ready
  const handleAudioReady = (audio: { url: string; filePath: string; durationSec: number }) => {
    setAudioInfo(audio);
  };

  const handleVoiceContinue = () => {
    markStepComplete(4);
    setCurrentStep(5);
  };

  const handleSkipAudio = () => {
    setAudioInfo(null);
    markStepComplete(4);
    setCurrentStep(5);
  };

  // Step 5: Render Complete
  const handleRenderComplete = (video: { url: string; path: string; durationSec: number }) => {
    setVideoInfo(video);
    markStepComplete(5);
  };

  const markStepComplete = (stepId: number) => {
    setCompletedSteps((prev) => (prev.includes(stepId) ? prev : [...prev, stepId]));
  };

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-slate-100 flex flex-col font-sans">
      {/* Top Editorial Navigation Bar */}
      <header className="border-b border-zinc-800 bg-[#0B0C0E]/95 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm">
              RA
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                REALTY ASSISTANT
                <span className="text-[10px] font-mono uppercase bg-blue-950 text-blue-400 border border-blue-800/80 px-1.5 py-0.5 rounded">
                  Studio v1.0
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 font-normal">
                AI Property Video Marketing Studio
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-zinc-800 text-xs">
              <span className="text-zinc-500 font-normal">Created by</span>
              <span className="text-white font-semibold">Harsh Partap Jain</span>
              <a
                href="mailto:harshpartapjainsdg@gmail.com"
                className="text-zinc-400 hover:text-blue-400 font-mono text-[11px] transition-colors"
              >
                (harshpartapjainsdg@gmail.com)
              </a>
            </div>
          </div>

          {/* Engine Status Indicators */}
          <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Kokoro:8880</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Whisper:8881</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>FFmpeg 9:16</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Step Progress Tabs */}
        <nav className="flex items-center justify-between border-b border-zinc-800 pb-4 overflow-x-auto gap-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCurrent = currentStep === step.id;
            const isCompleted = completedSteps.includes(step.id);

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (isCompleted || step.id <= currentStep) {
                    setCurrentStep(step.id);
                  }
                }}
                disabled={!isCompleted && step.id > currentStep}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  isCurrent
                    ? 'text-white bg-blue-600/10 border border-blue-600 text-blue-400'
                    : isCompleted
                    ? 'text-zinc-300 hover:text-white hover:bg-zinc-900 border border-transparent'
                    : 'text-zinc-600 cursor-not-allowed border border-transparent'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
                <span>{step.id}. {step.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Step Content Container */}
        <div className="p-6 sm:p-8 bg-zinc-950/80 border border-zinc-800 rounded-xl shadow-xl">
          {/* Step 1: Property Form */}
          {currentStep === 1 && (
            <PropertyForm
              initialData={property || undefined}
              onSubmit={handlePropertySubmit}
              onLoadSample={handleLoadSampleProperty}
            />
          )}

          {/* Step 2: Image Uploader */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <ImageUploader
                images={images}
                onChange={setImages}
                onLoadSampleImages={handleLoadSampleImages}
              />
              <div className="pt-4 flex justify-between items-center border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  ← Back to Property Facts
                </button>
                <button
                  type="button"
                  disabled={images.length < 4 || images.length > 8}
                  onClick={handleImagesConfirm}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  Confirm Photos & Generate Factual Story →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Story & Captions Editor */}
          {currentStep === 3 && script && (
            <StoryEditor
              fullNarration={script.fullNarration}
              scenes={scenes}
              estimatedTotalDurationSec={script.estimatedTotalDurationSec}
              onNarrationChange={handleNarrationChange}
              onSceneChange={handleSceneChange}
              onRegenerate={handleRegenerateScript}
              onContinue={handleScriptApprove}
              onSkipToRender={handleSkipToRender}
            />
          )}

          {/* Step 4: Kokoro Voice Studio (Optional) */}
          {currentStep === 4 && script && (
            <VoiceStudio
              script={script.fullNarration}
              onAudioReady={handleAudioReady}
              onContinue={handleVoiceContinue}
              onSkipAudio={handleSkipAudio}
            />
          )}

          {/* Step 5: Render Engine & Export Studio */}
          {currentStep === 5 && (
            <div>
              {!videoInfo ? (
                <RenderTimeline
                  scenes={scenes}
                  audioInfo={audioInfo}
                  onRenderComplete={handleRenderComplete}
                  onBack={() => setCurrentStep(4)}
                />
              ) : (
                <ExportStudio
                  video={videoInfo}
                  propertyTitle={property?.title || 'Luxury Residence'}
                  hasNarration={!!audioInfo}
                  onEdit={() => {
                    setVideoInfo(null);
                    setCurrentStep(3);
                  }}
                />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Minimal Footer with Author Attribution */}
      <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-400 space-y-1">
        <div>
          Realty Assistant Studio • Created by <span className="text-white font-semibold">Harsh Partap Jain</span> (
          <a href="mailto:harshpartapjainsdg@gmail.com" className="text-blue-400 hover:underline font-mono">
            harshpartapjainsdg@gmail.com
          </a>)
        </div>
        <div className="text-[11px] text-zinc-500">
          Clean Monochrome & Electric Blue Interface • Kokoro FastAPI TTS • Faster Whisper STT • FFmpeg 9:16 Compositing Engine
        </div>
      </footer>
    </div>
  );
}

