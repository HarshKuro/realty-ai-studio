# Realty Assistant | AI Property Video Marketing Studio

Realty Assistant is an editorial-grade property video marketing studio. Real-estate agents input listing specifications, upload 4–8 photographs, review a deterministic factual marketing script, optionally synthesize or upload voiceover narration, render genuine 9:16 vertical MP4 video through FFmpeg, preview playback in-browser, and download the finished asset.

**Zero Docker Required & Audio is Completely Optional:**
The studio runs 100% locally with Node.js and FFmpeg. No Docker containers are needed to render videos or pass automated tests. Narration is fully optional—agents can render silent 9:16 videos with burned-in visual captions (3.5s per plate), upload their own voiceover (.mp3/.wav), or use local Kokoro TTS if available.

---

## Key Capabilities

- **Minimalist Aesthetic:** Clean, high-contrast monochrome interface (Obsidian Black, Slate Gray, Crisp White) accented by purposeful Electric Blue (`#2563EB`). Zero cheesy gradients, no bloated icons, disciplined typography.
- **Factual Script Engine:** Deterministic script generator strictly grounded in provided listing facts. Never hallucinates square footage, amenities, or pricing. Operates 100% locally with zero external LLM API keys required.
- **Completely Optional Audio Pipeline:** Render clean silent 9:16 vertical videos with on-screen visual captions timed at 3.5s per photographic plate, upload custom voiceover audio files, or optionally synthesize speech using local Kokoro TTS.
- **Genuine FFmpeg 9:16 MP4 Rendering:** High-performance video compositor generating 1080x1920 @ 30fps vertical MP4s with proportional image framing, bottom safe-zone semi-translucent caption pills, and faststart (+moov) streaming. Verified with FFprobe.
- **Truthful Progress Tracking:** Honest stage milestones (`PREPARING_ASSETS` -> `RENDERING_VIDEO` -> `VALIDATING_EXPORT` -> `COMPLETED`) without fabricated percentage counters.
- **Zero-Docker Standalone Execution:** No background Docker containers required. All unit tests and build tasks pass 100% offline.
- **1-Click Demo Preloader:** Bundled sample property facts ("The Glass Pavilion & Sanctuary, Beverly Hills") and 5 high-resolution architectural plates for rapid demonstration.

---

## Quickstart

### Prerequisites
1. **Node.js** >= 18 (Tested on Node v24.13.0)
2. **FFmpeg & FFprobe** installed and accessible in system PATH (Tested on FFmpeg 8.1.1)
*(Note: Docker is NOT required)*

### Installation & Run

```bash
# Clone or navigate to the project
cd realty-assistant

# Install dependencies
npm install

# Run automated tests (100% offline, zero Docker required)
npm run test

# Build production bundle
npm run build

# Start production server
npm run start
# Or start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the studio.

---

## Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Default Value | Description |
|---|---|---|
| `KOKORO_BASE_URL` | `http://127.0.0.1:8880/v1` | Local Kokoro FastAPI GPU endpoint |
| `WHISPER_BASE_URL` | `http://127.0.0.1:8881/v1` | Local Faster Whisper STT endpoint |
| `RENDER_TIMEOUT_MS` | `120000` | Maximum video render timeout in milliseconds |
| `DEFAULT_ASPECT_RATIO` | `9:16` | Default video orientation (1080x1920) |
| `RENDER_OUTPUT_DIR` | `./public/renders` | Local disk directory for rendered audio & video assets |

---

## Architecture Overview

```text
realty-assistant/
├── app/
│   ├── api/
│   │   ├── media/upload/       # Validated multi-image upload handler
│   │   ├── render/start/        # Async FFmpeg rendering orchestrator
│   │   ├── render/status/[id]/  # Truthful stage polling
│   │   ├── script/generate/     # Deterministic factual script generator
│   │   ├── stt/transcribe/      # Faster Whisper voice dictation adapter
│   │   ├── tts/generate/        # Kokoro audio synthesis & duration probe
│   │   ├── tts/voices/          # Curated Kokoro voice catalog
│   │   └── video/[id]/          # Range-supported MP4 streaming & download
│   ├── layout.tsx               # Root editorial layout & metadata
│   └── page.tsx                 # Master studio 5-step interactive workflow
├── components/
│   ├── export/ExportStudio.tsx  # Playback, technical specs, and download
│   ├── media/ImageUploader.tsx  # 4–8 photo upload, reorder, and preview
│   ├── narration/VoiceStudio.tsx# Voice artist picker, speed, and player
│   ├── property/PropertyForm.tsx# Validated listing fact sheet
│   ├── property/VoiceInputModal.tsx # Whisper microphone dictation dialog
│   ├── studio/RenderTimeline.tsx# Truthful progress tracker
│   └── ui/VideoPlayer.tsx       # Custom 9:16 vertical video player
├── lib/
│   ├── config.ts                # Environment schema validation (Zod)
│   ├── story/
│   │   ├── scenePlanner.ts      # Visual plate & caption synchronization
│   │   └── scriptGenerator.ts   # Zero-hallucination factual script engine
│   └── validation/
│       ├── media.ts             # Image constraints (4–8 files, <10MB)
│       └── property.ts          # Zod schema for listing properties
├── public/
│   ├── samples/                 # Sample Beverly Hills listing facts & images
│   └── renders/                 # Verified generated audio & MP4 video files
├── scripts/
│   ├── generate-sample-assets.cjs # Synthetic plate generator
│   └── render-sample-demo.ts    # Real end-to-end demo verification script
├── server/
│   ├── providers/
│   │   ├── stt/whisperAdapter.ts# Faster Whisper client
│   │   └── tts/kokoroAdapter.ts # Kokoro OpenAI-compatible client
│   └── rendering/
│       ├── ffmpegRenderer.ts    # FFmpeg 9:16 compositing & caption burning
│       ├── jobTracker.ts        # In-memory truthful stage repository
│       ├── renderSpec.ts        # Strict render specification schema
│       └── videoValidator.ts    # FFprobe stream, codec, and duration probe
└── tests/                       # 16 unit & integration tests (Vitest)
```

---

## Real Demo Render Script

To render a verified MP4 directly from the command line:

```bash
npx tsx scripts/render-sample-demo.ts
```

Output is saved to `public/renders/videos/sample_beverly_hills_demo.mp4` and verified with `ffprobe` (1080x1920, H.264, AAC audio, 48.0s duration).

---

## Quality & Verification Summary

- **Automated Tests:** `16 passed` across `7 test suites` (`npm run test`)
- **Production Compile:** `Passed` (`npm run build`)
- **Verified Deliverable:** Genuine MP4 generated and validated with FFprobe.
