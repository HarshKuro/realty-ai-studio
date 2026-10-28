# Realty Assistant: Antigravity Prompt Pack
Use these prompts in order. `ANTIGRAVITY_MASTER_PROMPT.md` and `workflow.md` remain the project source of truth.

## Prompt 1: Repository audit and implementation
Read `workflow.md` and inspect the repository before changing anything. Check Git status, package scripts, framework/version, routes, components, styles, tests, environment examples, Docker containers, Kokoro/Whisper ports and live API docs, and FFmpeg/FFprobe. Do not assume endpoints or rewrite working code. Report the actual state and blockers, then implement the smallest complete property-to-MP4 workflow. Do not stop after planning.

## Prompt 2: Premium UI
Implement a cohesive premium real-estate video studio: editorial architecture-inspired styling, large property photography, warm neutral surfaces, charcoal text, one restrained accent, strong typography, precise spacing, responsive layout, accessible contrast, visible focus, and purposeful motion. Make Property → Photos → Story → Voice → Render → Export clear. Remove controls that do nothing. Do not break the media pipeline or create fake success states. Run checks.

## Prompt 3: Property form and media
Implement property validation and image upload following `workflow.md`. Include title, location, property type, optional price/bedrooms/bathrooms/area, features, contact, and CTA. Support 4–8 images, preview, reorder, and remove. Validate actual type, size, count, and image decodability server-side. Preserve order and form values on errors. Never invent facts. Add focused tests.

## Prompt 4: Factual script and scenes
Implement deterministic script and scene generation using only supplied facts. Do not require an external LLM API key. If a configured provider exists, keep it optional with local template fallback. Let users edit script and captions before narration. Omit missing facts instead of guessing. Validate text length and safe margins. Add tests for incomplete data and unsupported claims.

## Prompt 5: Kokoro integration
Inspect the actual running Kokoro container, image/version, port mapping, health, logs, and API documentation. Confirm exact endpoint, request schema, voice IDs, language support, and audio format before coding. Implement a server-side provider adapter. Generate a short test narration and verify it is playable. Add voice selection, audio preview, loading/error states, and timeout handling. Never guess endpoints/voice IDs or claim success on empty audio.

## Prompt 6: Real MP4 rendering
Inspect environment and repository, then implement a real MP4 renderer using the simplest compatible approach. Prefer FFmpeg for a small local-first app if suitable. Use a validated render specification for image order, duration, captions, dimensions, and audio. Pass process arguments safely. Add cleanup, failure handling, and output validation. Render an actual sample video and inspect it with FFprobe when available. Verify playback and download. Do not substitute a mock renderer.

## Prompt 7: Optional Faster Whisper
Only after Kokoro-to-MP4 works end to end, inspect the installed image docs and confirm the actual API schema. Add voice input/transcription with user review before applying transcript to the form. Typed entry must work if STT is unavailable. Skip this if the primary workflow is incomplete.

## Prompt 8: Final QA and submission
Run actual lint, type-check, test, and production-build commands. Walk through property entry, image upload/reorder, script review, Kokoro narration, MP4 render, playback, and download. Check invalid input, TTS outage, render failure recovery, responsive layout, accessibility, console errors, cleanup, and secret leakage. Verify the actual output and audio stream. Inspect Git diff. Update README and `.env.example`. Report exact commands, pass/fail results, MP4 evidence, and blockers. Do not claim unrun checks passed.
