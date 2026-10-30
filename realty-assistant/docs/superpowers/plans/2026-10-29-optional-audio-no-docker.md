# Optional Audio and Zero Docker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make audio narration completely optional, allow 3.5s/scene silent video rendering, and remove all requirements for Docker across the entire application and test suite.

**Architecture:** 
1. Make `audioFilePath` optional in `RenderSpecSchema` and `/api/render/start`. When omitted, default scene pacing to 3.5s per image and use FFmpeg `anullsrc` silent stream (or clean video) for universal player compatibility.
2. In the Next.js frontend, label Voice Studio as optional, allow skipping directly to Render from Story & Captions, provide a "Proceed Without Audio" action in Voice Studio, and support custom audio file upload if an agent wants narration without Kokoro.
3. Decouple automated tests from live Docker containers by adding offline fallback/conditional checks so `npm test` passes 100% locally.
4. Update navigation headers and documentation to remove misleading Docker container requirements.

**Tech Stack:** Next.js 16, React 19, TypeScript, FFmpeg / FFprobe, Vitest, Zod, Tailwind CSS.

**Spec:** Direct user requirement: "dont use docker and audio make it completly optional and make audio complely optional", with 3.5s scene pacing default for silent renders.

## Global Constraints
- Preserve existing deterministic factual script generator and 9:16 vertical FFmpeg pipeline.
- Output video must remain strictly valid 1080x1920 @ 30fps H.264 MP4 with burned captions.
- Zero external cloud/API keys required.
- Zero Docker container dependencies for standard operation and test passes.

## Review Focus
1. Rendering without any audio track produces a valid MP4 with burned captions and expected duration (`scenes.length * 3.5s`).
2. Skipping Voice Studio in UI proceeds smoothly to RenderTimeline and exports verified video.
3. Offline Kokoro/Whisper services do not crash the app or block video creation.
4. Vitest test suite (`npm test`) passes 100% green without any background Docker services running.
5. All file links use proper formatting.

---

### Task 1: Server Rendering & API Support for Optional Audio

**Files:**
- Modify: `server/rendering/renderSpec.ts`
- Modify: `server/rendering/ffmpegRenderer.ts`
- Modify: `app/api/render/start/route.ts`
- Modify: `tests/ffmpegRenderer.test.ts`

- [ ] Update `RenderSpecSchema` in `server/rendering/renderSpec.ts` to make `audioFilePath` optional (`z.string().optional()`).
- [ ] Update `server/rendering/ffmpegRenderer.ts` to handle renders without `spec.audioFilePath`:
  - When `audioFilePath` is provided: mux with narration audio.
  - When `audioFilePath` is omitted: generate a silent AAC audio track via `anullsrc` with duration matching total scene time (`scenes.length * 3.5s`), or render video with faststart.
- [ ] Update `app/api/render/start/route.ts` to allow requests without `audioFilePath`:
  - Default scene duration to `3.5s` per scene if no audio duration is given.
  - Do not reject requests when `audioFilePath` is absent.
- [ ] Add a unit test in `tests/ffmpegRenderer.test.ts` verifying rendering without `audioFilePath` produces a valid 1080x1920 MP4 of duration ~7s for 2 scenes.
- [ ] Run `npx vitest run tests/ffmpegRenderer.test.ts` to verify.

---

### Task 2: Offline Resilience in Provider Adapters & Unit Tests

**Files:**
- Modify: `server/providers/tts/kokoroAdapter.ts`
- Modify: `tests/kokoroAdapter.test.ts`
- Modify: `tests/whisperAdapter.test.ts`

- [ ] Ensure `KokoroAdapter` methods catch connection errors with clear offline status objects instead of unhandled rejections where appropriate.
- [ ] Update `tests/kokoroAdapter.test.ts` and `tests/whisperAdapter.test.ts` so that live service tests conditionally check health before asserting live responses, or test the offline error handling properly, preventing test suite failure when Docker is absent.
- [ ] Run `npm test` and verify that all test suites pass without Docker running.

---

### Task 3: UI Workflow - Voice Studio (Optional) & Direct Silent Rendering

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/narration/VoiceStudio.tsx`
- Modify: `components/story/StoryEditor.tsx` (if needed for quick render button)
- Modify: `components/studio/RenderTimeline.tsx`
- Modify: `components/export/ExportStudio.tsx`

- [ ] Update `app/page.tsx`:
  - Change Step 4 title to `Voice Studio (Optional)`.
  - Replace fake pulsing Docker status dots in the navigation bar with "Local FFmpeg Engine • No Docker Required".
  - Enable `RenderTimeline` in Step 5 when `audioInfo` is `null`.
  - Allow skipping from Step 3 directly to Step 5 or moving through Step 4 without audio.
- [ ] Update `components/narration/VoiceStudio.tsx`:
  - Display an informative non-blocking banner when Kokoro is offline ("Local Kokoro TTS service is offline (Docker is not required). You can proceed with a silent video or upload custom audio.").
  - Add "Skip Audio & Render Silent Video (3.5s / slide)" action buttons.
  - Add custom audio upload button (`.mp3`, `.wav`, `.m4a`) so agents can easily upload pre-recorded audio without Kokoro.
- [ ] Update `components/studio/RenderTimeline.tsx`:
  - Accept optional/nullable `audioInfo`.
  - When `audioInfo` is null, show truthful message: "Rendering 9:16 vertical video & burning visual captions (Silent mode, 3.5s/scene)".
- [ ] Update `components/export/ExportStudio.tsx`:
  - Adapt specifications table: show "Visual Captions Only (Silent)" or "Kokoro TTS / Custom Audio" dynamically based on whether audio was provided.

---

### Task 4: Documentation & Final Verification

**Files:**
- Modify: `README.md`
- Modify: `ANTIGRAVITY_MASTER_PROMPT.md`
- Modify: `workflow.md`

- [ ] Update `README.md` to clearly state that Docker is completely optional and not required, and audio narration is optional (with 3.5s/scene silent video export or custom audio upload).
- [ ] Run full test suite `npm run test`.
- [ ] Run build `npm run build` to ensure zero TypeScript or bundling errors.
- [ ] Test the demo render script or verify that silent render works end-to-end.

