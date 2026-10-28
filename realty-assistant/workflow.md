# workflow.md
## Realty Assistant: Submission-Ready Implementation Workflow

**Deadline:** Project submission tomorrow.  
**Priority:** Verified end-to-end product, not breadth of unfinished features.  
**Primary flow:** Property facts + images → script/scenes → Kokoro narration → real MP4 → preview/download.  
**Optional:** Faster Whisper after the primary flow is stable.

## 1. Product definition

Realty Assistant is a web-based property marketing studio. An agent enters listing details, uploads 4–8 photographs, reviews a factual promotional script, generates a voice-over using local Kokoro TTS, and exports a genuine MP4.

### Must work for submission
- Property details form
- Image upload, validation, preview, ordering, removal
- Script and scene caption generation from supplied facts
- Editable script
- Kokoro voice selection and narration generation when service is healthy
- Real MP4 rendering with one verified renderer
- Actual output preview and download
- Clear loading, success, and error states
- README, `.env.example`, and honest test report

### Defer until core flow works
Authentication, billing, cloud deployment, complex queues, extensive analytics, advanced STT, and features not needed for the demo.

## 2. Phase 0: Inspect the current project

Before changing files:
1. Run `git status` and inspect repository tree.
2. Read package manifest, lockfile, framework version, scripts, routes, components, styles, tests, README, and environment examples.
3. Read project instruction files.
4. Check Docker container status, port mappings, health checks, and logs without exposing secrets.
5. Confirm Kokoro and Whisper API paths from running `/docs`, OpenAPI schema, or documentation matching the installed image.
6. Check `ffmpeg -version`, `ffprobe -version`, and GPU access if relevant.
7. Identify existing implementations and defects.
8. Produce a concise plan and proceed.

Do not assume ports, endpoint names, voice IDs, model names, GPU support, codecs, or API compatibility.

## 3. Priority order

### P0: Real end-to-end generation
1. Property form and validation
2. Upload and order images
3. Factual deterministic script generation
4. Server-side Kokoro integration
5. Render specification and genuine MP4
6. Playback and download

### P1: Polish and reliability
1. Premium responsive UI
2. Progress/error states
3. File validation and temporary-file cleanup
4. README and `.env.example`
5. Core tests and demo verification

### P2: Optional enhancements
1. Faster Whisper voice input
2. More templates/aspect ratios
3. Project history and advanced transitions

## 4. Suggested architecture

Adapt to existing framework conventions. This is a guide, not a mandate.

```text
app/                         # Pages and route handlers
components/                  # Shared UI
features/
  property/                  # Listing form and validation
  media/                     # Upload, thumbnails, ordering
  story/                     # Script and scene editing
  narration/                 # TTS voice and audio preview
  studio/                    # Timeline, preview, render state
  export/                    # Playback/download
server/
  providers/tts/             # Kokoro adapter
  providers/stt/             # Optional Whisper adapter
  rendering/                 # Render spec and selected renderer
  services/                  # Use-case orchestration
lib/validation/              # Shared schemas
tests/                       # Unit/integration/e2e
docs/                        # Architecture and verification
public/samples/              # Clearly labeled demo assets
workflow.md
README.md
.env.example
```

Do not create unused folders. Keep React components independent of model-specific request details. Keep rendering outside frontend code and request handlers likely to time out.

## 5. Design and UX standards

Use a premium architectural/editorial aesthetic: large property imagery, warm neutral surfaces, charcoal text, one restrained brand accent, strong typography, precise spacing, responsive layouts, purposeful motion, reduced-motion support, accessible contrast, keyboard navigation, and visible focus.

Main workflow:
1. Property
2. Photos
3. Story and scenes
4. Voice Studio
5. Render
6. Preview and export

Every primary action needs disabled/invalid, loading, success, and failure states. Avoid fake controls, fake charts, fabricated progress, and sample media represented as real user content.

## 6. Property and media requirements

Fields:
- Title, location, property type
- Price or price-on-request
- Optional bedrooms, bathrooms, area
- Feature list
- Contact details and CTA
- Optional brand name/logo

Rules:
- Optional fields remain optional.
- Never invent property facts.
- Generate scripts with incomplete optional data.
- Show validation near relevant fields.

Images:
- Normal workflow accepts 4–8 images.
- Validate count, actual MIME/type, file size, and image decodability server-side.
- Support preview, reordering, and removal.
- Preserve user-selected order.
- Avoid stretching images.
- Use safe filenames and clean temporary assets.
- Revoke browser object URLs when no longer needed.

## 7. Script and scene generation

Start with deterministic templates; no external LLM API is mandatory. If a configured Gemini/OpenAI provider already exists, keep it optional with template fallback.

Generate a concise script and ordered scenes using only supplied facts. Never invent amenities, views, distances, price, area, legal claims, or benefits. Keep captions readable, allow edits, validate text lengths, and omit missing facts instead of guessing.

## 8. Kokoro TTS integration

Kokoro FastAPI GPU is the primary narration service.

Before coding, verify the live API endpoint, request/response schema, supported voices/languages, audio format, port mapping, and container network name. Test a short request and confirm playable audio.

Implementation:
- Server-side provider adapter; base URL in environment config.
- Voice selection limited to verified supported voices.
- Audio preview when practical.
- Validate generated audio exists, is non-empty, and decodes.
- Handle timeout, unavailable service, invalid voice, and invalid output.
- Cache only with a stable key containing script, voice, model/version, and settings.
- Never claim narration succeeded if it failed.

Example only; confirm actual service name and port:
```dotenv
TTS_ENABLED=true
KOKORO_BASE_URL=http://kokoro-tts:8880/v1
TTS_TIMEOUT_SECONDS=90
```
For a host-run app, the URL might use localhost. For a Dockerized app, use the actual Compose service name and internal port.

## 9. Faster Whisper STT (optional)

Only implement after Kokoro-to-MP4 works end to end. Verify the installed image API schema. Display transcript for review before applying it to the form. Typed input must remain functional if STT is unavailable. Do not troubleshoot STT while the primary workflow is incomplete.

## 10. MP4 rendering

Select one renderer based on the current repository/environment. For a small local-first submission, evaluate FFmpeg first. Use Remotion only if there is a clear reason.

Requirements:
- Genuine MP4 output, not a simulated player.
- Validated render specification is source of truth for image order, scene timing, captions, dimensions, frame rate, transitions, and audio.
- Safe process argument arrays; never concatenate user input into shell commands.
- Safe temporary paths and generated filenames.
- Handle missing FFmpeg, unsupported files, failures, timeout, and cleanup.
- Vertical 9:16 output by default; landscape is optional.
- Verify file exists and is non-empty; use FFprobe when available to verify duration, dimensions, codecs, and audio.
- Play actual output and test download.
- Never report success based on a mocked renderer.

Show truthful stages such as “Preparing images”, “Generating narration”, “Rendering video”, and “Validating export”; never fabricate percentages.

## 11. Error handling and fallback

If TTS is unavailable, preserve the script and show a clear message. If external LLM configuration is absent, use local templates. If STT is unavailable, typed entry works. If rendering fails, preserve form data and offer retry. Never expose internal paths, stack traces, or secrets.

## 12. Tests and final verification

Run actual available lint, type-check, tests, and production build commands. Verify:
1. Valid property data and images
2. Missing optional fields
3. Invalid image count/type/size
4. Script generation without API key
5. Kokoro success and unavailable behavior
6. Genuine MP4 rendering
7. Audio stream when narration is enabled
8. Playback and download
9. Responsive layout and keyboard focus
10. No console errors in primary journey where tooling exists

Test at least one real render. A fake renderer test is not proof of MP4 functionality.

## 13. Submission deliverables

- Functional app and polished UI
- End-to-end property-to-MP4 flow
- Kokoro narration when local service is available
- Optional Faster Whisper only if time remains
- `.env.example` with placeholders only
- README with setup, commands, model configuration, rendering requirements, troubleshooting
- Clearly labeled sample property
- Real sample MP4 if environment supports rendering
- Core tests and accurate verification notes
- Final report with implemented features, exact commands, test results, render evidence, and blockers

Do not deploy, commit, push, or incur paid API usage without authorization.

## 14. Definition of done

A user enters property facts, uploads images, reviews/edits a factual script, generates local Kokoro narration, renders a genuine MP4, plays it, and downloads it. The core flow remains usable when optional STT or external LLM services are unavailable. Report limitations honestly.
