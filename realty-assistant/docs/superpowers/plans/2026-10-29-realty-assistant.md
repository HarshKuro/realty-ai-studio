# Realty Assistant: AI Property Video Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a submission-ready, production-grade property marketing video studio where a real-estate agent inputs property facts, uploads 4–8 photos, reviews a deterministic script, generates local Kokoro TTS narration, renders a genuine 9:16 vertical MP4 via FFmpeg, and previews/downloads the verified output.

**Architecture:** Next.js 15 (App Router, React 19, TypeScript, Tailwind CSS) providing a minimalist monochrome & electric blue editorial interface backed by secure server-side API routes for media validation, factual script generation, Kokoro FastAPI TTS, and local FFmpeg 9:16 video rendering.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Zod, FFmpeg/FFprobe 8.1.1, Kokoro FastAPI GPU (port 8880), Faster Whisper Server (port 8881), Vitest.

**Spec:** `workflow.md` and `ANTIGRAVITY_MASTER_PROMPT.md`

## Global Constraints

- **Minimalist Aesthetic:** Clean black, white, and electric blue palette (`#090A0C`, `#FFFFFF`, `#2563EB`, `#64748B`, `#E2E8F0`). No cheesy gradients, no ugly emojis/bloated icons, no fake charts.
- **Zero Hallucination:** Deterministic script and scene generation from supplied facts only. Never invent square footage, amenities, views, or pricing.
- **Real Video Rendering:** FFmpeg must generate genuine H.264/AAC MP4 files (1080x1920 vertical), verified with FFprobe. No mock canvas renderers or fake player simulations.
- **Local AI Services:** Server-side adapters only. Kokoro TTS at `http://127.0.0.1:8880/v1` is primary; Faster Whisper STT at `http://127.0.0.1:8881/v1` is optional and non-blocking.
- **Truthful States:** Status messages reflect actual background stages (`PREPARING_ASSETS`, `GENERATING_NARRATION`, `RENDERING_VIDEO`, `VALIDATING_EXPORT`). Never fabricate percentage counters.
- **Safe Execution:** Parameterized FFmpeg argument arrays without shell injection risks; temporary file isolation and cleanup.

## Review Focus

1. **Missing Optional Facts:** When optional fields (bedrooms, bathrooms, area, price) are omitted, the script and captions must remain grammatically fluid without displaying "undefined" or placeholder text.
2. **TTS Outage Recovery:** If Kokoro is unreachable or returns an error, the system must preserve the user's form and script, display a clear actionable diagnostic, and offer audio retry without losing data.
3. **Image Count & Dimension Mismatch:** Uploading non-standard aspect ratios or orientations (portrait + landscape mixed) must be safely letterboxed/blurred-backgrounded to 1080x1920 without image distortion or FFmpeg crashes.
4. **Captions & Safe Margins:** Scene captions must wrap cleanly within the 9:16 vertical viewport with high-contrast semi-translucent backdrops and stay away from platform overlay zones (TikTok/Reels safe zones).
5. **Concurrent Render Isolation:** Temporary image slices and audio files must use unique project job IDs (`uuidv4`) in `os.tmpdir()/realty-assistant/jobs/<id>` to prevent race conditions or cross-project file corruption.

---

### Task 1: Project Scaffold, Minimalist Design Tokens & Environment
- Next.js 15, Tailwind CSS, TypeScript, Vitest setup, `.env.example`, design tokens.

### Task 2: Property Validation, Media Pipeline & Sample Assets
- Zod schema for property facts, image validator (4–8 images, <10MB, decodable), upload route, sample property asset pack.

### Task 3: Deterministic Factual Script & Scene Generator
- Local factual script generation engine, scene splitter, inline editor, reading time estimator.

### Task 4: Server-Side Kokoro TTS Provider & Voice Studio
- Kokoro FastAPI GPU client (`/v1/audio/speech`, `/v1/audio/voices`), audio caching, VoiceStudio UI with instant preview.

### Task 5: Real MP4 Video Renderer (FFmpeg 9:16 Vertical Engine)
- Render specification, FFmpeg filtergraph (1080x1920, ken burns, burned captions, audio merge, faststart), FFprobe output validator, async job tracker.

### Task 6: Video Player, Export Studio & Download Flow
- HTML5 custom video player, one-click download, project summary, re-render/edit flow.

### Task 7: Faster Whisper Voice Input Integration (Optional Enhancement)
- Speech-to-text recording modal, transcript preview & review dialog before applying to form.

### Task 8: QA Verification, Demo Sample Render & Submission Artifacts
- Full test pass, production build, real MP4 sample render verified by ffprobe, comprehensive README and verification report.

