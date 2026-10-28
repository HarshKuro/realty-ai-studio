# Realty Assistant: AI Property Video Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a submission-ready, production-grade property marketing video studio where a real-estate agent inputs property facts, uploads 4–8 photos, reviews a deterministic script, generates local Kokoro TTS narration, renders a genuine 9:16 vertical MP4 via FFmpeg, and previews/downloads the verified output.

**Architecture:** Next.js 15 (App Router, React 19, TypeScript, Tailwind CSS) providing a minimalist monochrome & electric blue editorial interface backed by secure server-side API routes for media validation, factual script generation, Kokoro FastAPI TTS, and local FFmpeg 9:16 video rendering.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Zod, FFmpeg/FFprobe 8.1.1, Kokoro FastAPI GPU (port 8880), Faster Whisper Server (port 8881), Vitest.

**Spec:** `realty-assistant/workflow.md` and `realty-assistant/ANTIGRAVITY_MASTER_PROMPT.md`

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

**Files:**
- Create: `realty-assistant/package.json`
- Create: `realty-assistant/tsconfig.json`
- Create: `realty-assistant/next.config.ts`
- Create: `realty-assistant/tailwind.config.ts`
- Create: `realty-assistant/app/globals.css`
- Create: `realty-assistant/app/layout.tsx`
- Create: `realty-assistant/.env.example`
- Create: `realty-assistant/vitest.config.ts`
- Test: `realty-assistant/tests/environment.test.ts`

**Interfaces:**
- Produces: Base Next.js app with Tailwind styling, environment variable validation, and Vitest test harness.

- [ ] **Step 1: Write environment configuration test**
```typescript
// tests/environment.test.ts
import { describe, it, expect } from 'vitest';
import { envConfig } from '../lib/config';

describe('Environment Configuration', () => {
  it('loads default Kokoro and Whisper URLs', () => {
    expect(envConfig.kokoroBaseUrl).toBeDefined();
    expect(envConfig.whisperBaseUrl).toBeDefined();
    expect(envConfig.renderOutputDir).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/environment.test.ts` (in `realty-assistant`)
Expected: FAIL (files not yet created).

- [ ] **Step 3: Scaffold Next.js 15, Tailwind tokens, and config loader**
Configure Tailwind tokens for the minimalist black, white, and electric blue palette:
- Background: `#0B0C0E` (dark), `#F8F9FA` (light surface)
- Surface: `#13151A` (card/panel dark), `#FFFFFF` (card/panel light)
- Border: `#22262E` (dark border), `#E2E8F0` (light border)
- Primary Accent: `#2563EB` (pure electric blue), Hover: `#1D4ED8`
- Text: `#F8FAFC` (primary dark mode), `#0F172A` (primary light mode), `#94A3B8` (muted)
Create `lib/config.ts` with Zod validation for `KOKORO_BASE_URL` (`http://127.0.0.1:8880/v1`), `WHISPER_BASE_URL` (`http://127.0.0.1:8881/v1`), and `RENDER_TIMEOUT_MS`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/environment.test.ts`
Expected: PASS.

- [ ] **Step 5: Verify build & commit**
Run: `npm run build`
Expected: Successful compile.

---

### Task 2: Property Validation, Media Pipeline & Sample Assets

**Files:**
- Create: `realty-assistant/lib/validation/property.ts`
- Create: `realty-assistant/lib/validation/media.ts`
- Create: `realty-assistant/app/api/media/upload/route.ts`
- Create: `realty-assistant/components/property/PropertyForm.tsx`
- Create: `realty-assistant/components/media/ImageUploader.tsx`
- Create: `realty-assistant/public/samples/property.json`
- Create: `realty-assistant/public/samples/images/sample1.jpg` (to sample5.jpg)
- Test: `realty-assistant/tests/validation.test.ts`

**Interfaces:**
- Produces: `PropertyDetails` type, `PropertySchema`, `ImageItem` type, upload API endpoint handling 4–8 images, and sample demo preloader.

- [ ] **Step 1: Write property and media validation tests**
```typescript
// tests/validation.test.ts
import { describe, it, expect } from 'vitest';
import { PropertySchema } from '../lib/validation/property';
import { validateImageFiles } from '../lib/validation/media';

describe('Property Schema Validation', () => {
  it('validates a complete property payload', () => {
    const valid = PropertySchema.safeParse({
      title: 'Modern Sunset Villa',
      location: 'Malibu, CA',
      propertyType: 'Single Family Villa',
      price: '$4,250,000',
      bedrooms: 4,
      bathrooms: 3.5,
      areaSqFt: 3800,
      features: ['Infinity pool', 'Ocean views', 'Chef kitchen'],
      contact: 'Sarah Jenkins (555) 019-2831',
      cta: 'Schedule a private tour today'
    });
    expect(valid.success).toBe(true);
  });

  it('permits omitted optional fields gracefully', () => {
    const valid = PropertySchema.safeParse({
      title: 'City Penthouse',
      location: 'Downtown',
      propertyType: 'Penthouse',
      features: ['Private terrace'],
      contact: 'info@realty.com',
      cta: 'Inquire now'
    });
    expect(valid.success).toBe(true);
  });

  it('rejects image count below 4 or above 8', () => {
    expect(validateImageFiles(3).valid).toBe(false);
    expect(validateImageFiles(5).valid).toBe(true);
    expect(validateImageFiles(9).valid).toBe(false);
  });
});
```

- [ ] **Step 2: Run validation tests to verify they fail**
Run: `npx vitest run tests/validation.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement schemas, upload handler, and UI components**
- Define `PropertySchema` and `validateImageFiles` with Zod.
- Create `PropertyForm.tsx` with responsive two-column grid, clean focus outlines, and error banners.
- Create `ImageUploader.tsx` with drag-and-drop, thumbnail previews, up/down reorder buttons, image removal, and count status (e.g. "5 of 4–8 images uploaded").
- Bundle 5 high-resolution architectural sample images and pre-load button for "Load Sample Listing".

- [ ] **Step 4: Run validation tests to verify they pass**
Run: `npx vitest run tests/validation.test.ts`
Expected: PASS.

---

### Task 3: Deterministic Factual Script & Scene Generator

**Files:**
- Create: `realty-assistant/lib/story/scriptGenerator.ts`
- Create: `realty-assistant/lib/story/scenePlanner.ts`
- Create: `realty-assistant/app/api/script/generate/route.ts`
- Create: `realty-assistant/components/story/StoryEditor.tsx`
- Test: `realty-assistant/tests/scriptGenerator.test.ts`

**Interfaces:**
- Consumes: `PropertyDetails`, `ImageItem[]`
- Produces: `VideoScript` `{ fullNarration: string, scenes: ScenePlan[] }`
  - `ScenePlan`: `{ id: string, imageId: string, imageIndex: number, caption: string, narrationSlice: string, estimatedDurationSec: number }`

- [ ] **Step 1: Write script generator unit tests**
```typescript
// tests/scriptGenerator.test.ts
import { describe, it, expect } from 'vitest';
import { generateFactualScript } from '../lib/story/scriptGenerator';

describe('Deterministic Script Generator', () => {
  it('generates scenes without hallucinating missing fields', () => {
    const result = generateFactualScript({
      title: 'Minimalist Glass House',
      location: 'Aspen, CO',
      propertyType: 'Luxury Retreat',
      features: ['Heated floors', 'Mountain vistas'],
      contact: 'Agent Dave',
      cta: 'Contact us for details'
    }, 5);

    expect(result.scenes.length).toBe(5);
    expect(result.fullNarration).toContain('Minimalist Glass House');
    expect(result.fullNarration).toContain('Aspen, CO');
    expect(result.fullNarration).not.toContain('undefined');
    expect(result.fullNarration).not.toContain('sq ft');
  });

  it('includes price and area when provided', () => {
    const result = generateFactualScript({
      title: 'Urban Loft',
      location: 'SoHo, NY',
      propertyType: 'Loft',
      price: '$2,100,000',
      areaSqFt: 1850,
      features: ['Exposed brick'],
      contact: 'Jane',
      cta: 'Book viewing'
    }, 4);
    expect(result.fullNarration).toContain('$2,100,000');
    expect(result.fullNarration).toContain('1,850 square feet');
  });
});
```

- [ ] **Step 2: Run script generator tests to verify failure**
Run: `npx vitest run tests/scriptGenerator.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement deterministic script generator & StoryEditor component**
- Implement `generateFactualScript`: formats introduction, key feature highlights mapped 1:1 across image count, specifications, and closing CTA.
- Build `StoryEditor.tsx`: allows inline editing of the complete voice-over script and individual scene captions, shows estimated speaking duration (at ~150 words per minute), and validates caption length for video readability.

- [ ] **Step 4: Run script generator tests to verify they pass**
Run: `npx vitest run tests/scriptGenerator.test.ts`
Expected: PASS.

---

### Task 4: Server-Side Kokoro TTS Provider & Voice Studio

**Files:**
- Create: `realty-assistant/server/providers/tts/kokoroAdapter.ts`
- Create: `realty-assistant/app/api/tts/voices/route.ts`
- Create: `realty-assistant/app/api/tts/generate/route.ts`
- Create: `realty-assistant/components/narration/VoiceStudio.tsx`
- Test: `realty-assistant/tests/kokoroAdapter.test.ts`

**Interfaces:**
- Consumes: Script text, voice ID, speed multiplier
- Produces: `/api/tts/voices` returning available voices; `/api/tts/generate` returning `{ audioUrl: string, audioFilePath: string, durationSec: number }`

- [ ] **Step 1: Write Kokoro adapter tests**
```typescript
// tests/kokoroAdapter.test.ts
import { describe, it, expect } from 'vitest';
import { KokoroAdapter } from '../server/providers/tts/kokoroAdapter';

describe('Kokoro TTS Adapter', () => {
  it('connects to live Kokoro container and lists curated voices', async () => {
    const adapter = new KokoroAdapter('http://127.0.0.1:8880/v1');
    const voices = await adapter.listVoices();
    expect(voices.length).toBeGreaterThan(0);
    const heart = voices.find(v => v.id === 'af_heart');
    expect(heart).toBeDefined();
  });

  it('generates speech audio buffer from short text', async () => {
    const adapter = new KokoroAdapter('http://127.0.0.1:8880/v1');
    const { buffer, duration } = await adapter.synthesize({
      input: 'Welcome to this architectural masterpiece.',
      voice: 'af_heart',
      speed: 1.0
    });
    expect(buffer.length).toBeGreaterThan(1000);
    expect(duration).toBeGreaterThan(0.5);
  }, 15000);
});
```

- [ ] **Step 2: Run Kokoro tests to verify connectivity**
Run: `npx vitest run tests/kokoroAdapter.test.ts`
Expected: PASS (given verified running Kokoro container on port 8880).

- [ ] **Step 3: Implement Kokoro server adapter, API routes, and VoiceStudio UI**
- `kokoroAdapter.ts`: OpenAI-compatible request payload to `/v1/audio/speech`, error handling for timeouts or unavailable container, audio duration probing using ffprobe.
- `VoiceStudio.tsx`: Voice selector dropdown with grade indicators (e.g., `af_heart` [Grade A, Warm Female], `am_michael` [Grade A, Confident Male]), speed slider (0.8x to 1.2x), instant "Preview Sample" button, and audio playback player.

- [ ] **Step 4: Re-run tests**
Run: `npx vitest run tests/kokoroAdapter.test.ts`
Expected: PASS.

---

### Task 5: Real MP4 Video Renderer (FFmpeg 9:16 Vertical Engine)

**Files:**
- Create: `realty-assistant/server/rendering/renderSpec.ts`
- Create: `realty-assistant/server/rendering/ffmpegRenderer.ts`
- Create: `realty-assistant/app/api/render/start/route.ts`
- Create: `realty-assistant/app/api/render/status/[jobId]/route.ts`
- Create: `realty-assistant/components/studio/RenderTimeline.tsx`
- Test: `realty-assistant/tests/ffmpegRenderer.test.ts`

**Interfaces:**
- Consumes: `RenderSpec` `{ scenes: { imagePath: string, durationSec: number, caption: string }[], audioFilePath: string, width: 1080, height: 1920, fps: 30 }`
- Produces: Rendered MP4 file path on disk, public static URL `/api/video/download/[id]`, job status updater.

- [ ] **Step 1: Write FFmpeg renderer unit and integration test**
```typescript
// tests/ffmpegRenderer.test.ts
import { describe, it, expect } from 'vitest';
import { executeFfmpegRender } from '../server/rendering/ffmpegRenderer';
import { validateVideoFile } from '../server/rendering/videoValidator';
import path from 'path';

describe('FFmpeg 9:16 Video Renderer', () => {
  it('renders a real 9:16 MP4 video and validates with ffprobe', async () => {
    const sampleDir = path.resolve('./public/samples');
    const result = await executeFfmpegRender({
      jobId: 'test-job',
      width: 1080,
      height: 1920,
      fps: 30,
      scenes: [
        { imagePath: path.join(sampleDir, 'images/sample1.jpg'), durationSec: 2, caption: 'Grand Entrance' },
        { imagePath: path.join(sampleDir, 'images/sample2.jpg'), durationSec: 2, caption: 'Designer Living Area' }
      ],
      audioFilePath: path.join(sampleDir, 'audio/test_audio.mp3'),
      aspectRatio: '9:16'
    });

    expect(result.outputPath).toBeDefined();
    const probe = await validateVideoFile(result.outputPath);
    expect(probe.width).toBe(1080);
    expect(probe.height).toBe(1920);
    expect(probe.hasAudio).toBe(true);
    expect(probe.duration).toBeGreaterThan(3.5);
  }, 30000);
});
```

- [ ] **Step 2: Run test to verify failure**
Run: `npx vitest run tests/ffmpegRenderer.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement FFmpeg filtergraph, process execution, and subtitle burning**
- Construct clean, robust FFmpeg filtergraph:
  - Scales images to 1080x1920 with aspect-ratio preserving zoompan or pad with blurred background.
  - Generates crossfades / cuts matching exact scene audio durations.
  - Draws minimalist subtitles with crisp typography (libfreetype / drawtext or ASS subtitle stream) positioned at the bottom third safe-zone.
  - Merges AAC narration audio stream into H.264 video container with faststart (`-movflags +faststart`).
- Implement async job tracker and status polling route.
- Implement `RenderTimeline.tsx` displaying real pipeline stages (`PREPARING_IMAGES`, `GENERATING_NARRATION`, `RENDERING_VIDEO`, `VALIDATING_EXPORT`).

- [ ] **Step 4: Run FFmpeg integration test to verify real MP4 production**
Run: `npx vitest run tests/ffmpegRenderer.test.ts`
Expected: PASS (produces verified MP4 on disk with FFprobe validating 1080x1920 and audio stream).

---

### Task 6: Video Player, Export Studio & Download Flow

**Files:**
- Create: `realty-assistant/app/api/video/[id]/route.ts`
- Create: `realty-assistant/components/export/ExportStudio.tsx`
- Create: `realty-assistant/components/ui/VideoPlayer.tsx`
- Modify: `realty-assistant/app/page.tsx`
- Test: `realty-assistant/tests/export.test.ts`

**Interfaces:**
- Produces: Integrated end-to-end studio page orchestrating the 5 steps:
  1. Property Details Form
  2. Photo Upload & Reordering
  3. Script & Captions Editor
  4. Kokoro Voice Studio
  5. Render & Export Preview

- [ ] **Step 1: Write export API tests**
```typescript
// tests/export.test.ts
import { describe, it, expect } from 'vitest';
import { GET } from '../app/api/video/[id]/route';

describe('Video Export Route', () => {
  it('serves video with proper Range and Content-Type headers', async () => {
    // verify route handler returns video/mp4 with Content-Disposition
  });
});
```

- [ ] **Step 2: Implement VideoPlayer, ExportStudio and integrated multi-step page**
- Clean custom HTML5 video player with sleek timeline bar, timecode display, play/pause, volume, and fullscreen.
- Direct download button streaming the file with proper filename (`[property-title]-vertical.mp4`).
- Reset / Edit button allowing the user to tweak script or photos and re-render seamlessly.
- Error banner with retry capability if anything fails.

- [ ] **Step 3: Verify end-to-end UI journey**
Run `npm run build` to confirm zero lint or TypeScript errors across all components.

---

### Task 7: Faster Whisper Voice Input Integration (Optional Enhancement)

**Files:**
- Create: `realty-assistant/server/providers/stt/whisperAdapter.ts`
- Create: `realty-assistant/app/api/stt/transcribe/route.ts`
- Create: `realty-assistant/components/property/VoiceInputModal.tsx`
- Test: `realty-assistant/tests/whisperAdapter.test.ts`

**Interfaces:**
- Consumes: Audio blob recorded from user microphone
- Produces: Transcribed text and parsed property fields for user review before applying to form.

- [ ] **Step 1: Write Whisper adapter test**
```typescript
// tests/whisperAdapter.test.ts
import { describe, it, expect } from 'vitest';
import { WhisperAdapter } from '../server/providers/stt/whisperAdapter';
import path from 'path';

describe('Whisper STT Adapter', () => {
  it('transcribes an audio file via Whisper container', async () => {
    const adapter = new WhisperAdapter('http://127.0.0.1:8881/v1');
    const audioPath = path.resolve('./public/samples/audio/test_audio.mp3');
    const transcript = await adapter.transcribe(audioPath);
    expect(transcript.text.length).toBeGreaterThan(5);
  }, 20000);
});
```

- [ ] **Step 2: Implement Whisper adapter, transcription endpoint, and VoiceInputModal**
- Adapter connects to `http://127.0.0.1:8881/v1/audio/transcriptions` sending `multipart/form-data`.
- Audio recording modal allows agent to speak property details, displays transcript for review, extracts key details (title, price, features), and allows confirmation before applying to form fields.
- Purely progressive enhancement: if Whisper is offline, form remains 100% functional via manual input.

- [ ] **Step 3: Run Whisper tests**
Run: `npx vitest run tests/whisperAdapter.test.ts`
Expected: PASS.

---

### Task 8: QA Verification, Demo Sample Render & Submission Artifacts

**Files:**
- Create: `realty-assistant/scripts/render-sample-demo.ts`
- Create: `realty-assistant/README.md` (updated with exact instructions and verified test logs)
- Create: `realty-assistant/.env.example`
- Create: `realty-assistant/VERIFICATION_REPORT.md`

- [ ] **Step 1: Run comprehensive test suite**
Run: `npm run test`
Expected: All unit and integration tests PASS.

- [ ] **Step 2: Run production build and typecheck**
Run: `npm run build`
Expected: Production build compiles with zero errors.

- [ ] **Step 3: Execute real sample MP4 render script**
Run: `npx tsx scripts/render-sample-demo.ts`
Verify generated MP4 with `ffprobe`:
- Duration matches audio duration.
- Resolution is 1080x1920 (9:16).
- H.264 video stream + AAC audio stream.
- Audio speech is audible and clean.

- [ ] **Step 4: Generate VERIFICATION_REPORT.md and final documentation**
Document exact commands, test outcomes, ffprobe stream inspection, and live environment configuration.

