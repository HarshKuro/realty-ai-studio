# ANTIGRAVITY MASTER PROMPT
## Realty Assistant | AI Property Video Studio

You are the senior product engineer, UX designer, and pragmatic architect responsible for completing Realty Assistant, an AI-assisted property marketing video studio. The project must be demonstrably functional for a submission tomorrow. Prioritize a complete, verified end-to-end workflow over broad but unfinished features.

## Mission
Build a polished web application where a real-estate agent enters property facts, uploads 4–8 images, reviews an accurate marketing script, generates narration with a local Kokoro FastAPI service, renders a genuine MP4, previews it, and downloads it. Faster Whisper is optional for voice input/transcription and must never block the main workflow.

## Critical execution rule
Inspect the existing repository first. Do not assume the stack, files, dependencies, routes, service ports, model API paths, GPU support, or working features. Preserve useful existing code and user changes. Do not rewrite the app wholesale.

Before editing:
1. Inspect repo tree, Git status, package manifest/lockfile, scripts, routes, styles, README, environment examples, and tests.
2. Read project instructions and relevant installed skill instructions before using skills.
3. Check Docker container status, configured ports, health/logs, and actual API routes from live docs or the README matching the installed image.
4. Check FFmpeg/FFprobe and GPU visibility if relevant.
5. Report actual stack, working parts, blockers, and a short plan. Then implement without waiting unless a genuine decision or destructive action is required.

## Deadline strategy
Submission is tomorrow. Implement the smallest complete vertical slice first:
1. Property form and image upload
2. Factual script generation with deterministic local fallback
3. Kokoro narration, with clear error state if unavailable
4. Real MP4 rendering through one verified rendering approach
5. Actual video preview and download
6. Responsive, polished UI
7. Tests and demo verification

Do not start with login, billing, elaborate admin panels, complex queues, multi-provider abstractions, or cloud infrastructure unless already implemented and required. Do not spend time on optional STT before the main flow works.

## Visual direction
Create a premium, cinematic real-estate studio: architectural editorial styling, large property imagery, confident typography, warm ivory/stone surfaces, charcoal text, and one restrained brand accent. Make it deliberate, modern, and sophisticated rather than a generic AI dashboard.

Use strong hierarchy, consistent spacing/type tokens, responsive layouts, purposeful motion, reduced-motion support, accessible labels, keyboard navigation, visible focus, sufficient contrast, and clear empty/loading/success/error states. Avoid generic gradient-heavy templates, card clutter, fake charts/progress, decorative controls that do nothing, and sample media represented as customer content.

## Required user journey
1. Create a video project.
2. Enter property title, location, type, price or price-on-request, optional bedrooms/bathrooms/area, features, contact details, and CTA.
3. Upload 4–8 images; preview, reorder, remove.
4. Generate a short script and scene plan using supplied facts only.
5. Edit/approve script and captions.
6. Select a supported Kokoro voice and generate narration.
7. Render a genuine MP4 with images, captions, transitions, and narration; music is optional.
8. Show truthful status and recoverable errors.
9. Play the actual rendered file and download it.
10. Allow editing and regeneration.

## Local AI services
### Kokoro TTS
Use the running Kokoro FastAPI GPU container as primary narration provider. Verify actual API path, request schema, voice IDs, supported languages, and audio formats against live docs or installed image version. Do not guess endpoints or voice IDs.
- Server-side provider adapter only; never call internal model URLs from browser code.
- Editable script and voice selection.
- Preview audio before rendering where practical.
- Validate generated audio exists, is non-empty, and is readable.
- Handle timeout, unavailable service, invalid voice, empty output, unsupported format.
- Cache only when the key includes script, voice, model/version, and generation settings.
- If TTS fails, preserve the script and show the failure honestly; never claim speech was generated.

### Faster Whisper STT
Optional and lower priority. Implement only after the complete TTS-to-MP4 flow works.
- Verify actual endpoint and payload schema for the installed image.
- Support audio input only if time remains.
- Show transcription for review before applying it to property fields.
- Never invent facts from uncertain transcription.
- STT failure must not block typed entry or video creation.

### External LLM
No external LLM API is mandatory. Default to deterministic script templates based solely on supplied facts. If Gemini or OpenAI is already configured, keep it optional behind a server-side adapter and retain local fallback. Never require an API key for the basic demo or expose keys to the client.

## Video rendering
Inspect the environment before selecting a renderer. For a compact local-first MVP, evaluate FFmpeg first; evaluate Remotion only if the current stack benefits from it. Select one primary renderer and document why.
- Produce a genuine MP4, not a fake preview or static mockup.
- Use a validated render specification as source of truth for scenes, order, timing, captions, dimensions, frame rate, audio, and transitions.
- Preview the actual output file.
- Use safe process argument passing; never interpolate user input into shell commands.
- Use generated safe filenames and protect against path traversal.
- Handle missing FFmpeg, unsupported images, process failure, timeout, cleanup, and output validation.
- Set sensible vertical 9:16 output by default; landscape is optional.
- Verify file existence, non-zero size, duration, dimensions, and audio stream using FFprobe when available.
- Do not claim success until output is verified. Never fabricate progress percentages.

## Architecture
Adapt to the current stack. Prefer clear feature boundaries without overengineering. Example boundaries:
- `features/property/`: property input and domain rules
- `features/media/`: uploads, validation, ordering, previews
- `features/story/`: script and scene editing
- `features/narration/`: voice choice, TTS generation, audio preview
- `features/studio/`: preview, render status, scene configuration
- `features/export/`: MP4 playback/download
- `server/providers/tts/`: Kokoro adapter
- `server/providers/stt/`: optional Faster Whisper adapter
- `server/rendering/`: render spec and renderer
- `server/services/`: orchestration
- `lib/validation/`: schemas
- `tests/`: unit/integration/e2e
- `docs/`: setup and verification

Follow existing framework conventions; do not create empty folders to match this example. Avoid a database unless persistence is needed or already exists.

## Security and robustness
Validate form data on client and server. Validate uploaded file type, size, count, and image decodability. Sanitize user strings in captions, filenames, logs, and commands. Keep provider URLs and secrets server-side. Use `.env.example` with placeholders. Do not expose internal paths or stack traces. Clean temporary assets. Do not deploy, commit, push, or incur paid API usage without authorization.

## Quality gates
Run available formatter, linter, type checker, unit/integration tests, production build, and browser journey if tooling exists. Verify invalid inputs, TTS success/unavailability, real MP4 render, playback/download, truthful failure states, responsiveness, keyboard focus, and console/network errors. Do not claim tests passed unless run. If a dependency/API is unavailable, report the precise blocker and finish independent work.

## Deliverables
- Functional end-to-end application and premium responsive UI
- Working local Kokoro narration when service is available
- Optional Faster Whisper only if time remains
- Genuine MP4 render, preview, and download
- `.env.example`
- README with setup, commands, model configuration, FFmpeg requirements, troubleshooting
- Clearly labeled sample property and real sample video if environment supports rendering
- Tests for property validation, script generation, and render orchestration
- Final report listing implemented work, exact commands/tests, MP4 verification evidence, and blockers

## Definition of done
A user enters property facts, uploads images, reviews the script, generates local narration, renders a real MP4, plays it, and downloads it. The UI is polished, and all verification claims are evidence-based.
