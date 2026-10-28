# Realty Assistant Submission Pack

Files:
- `ANTIGRAVITY_MASTER_PROMPT.md`: Main instruction to the coding agent.
- `workflow.md`: Project workflow and acceptance criteria.
- `PROMPT_PACK.md`: Focused prompts for each implementation phase.

## How to use
1. Copy these files into the root of your existing project.
2. Open the repository in Antigravity.
3. Paste `ANTIGRAVITY_MASTER_PROMPT.md` as the main task.
4. Tell the agent to read and follow `workflow.md`.
5. Use prompts from `PROMPT_PACK.md` for focused passes.
6. Require a real MP4 render and verification before calling the project complete.

## Important
Do not assume Docker service names, ports, endpoints, voice IDs, or GPU compatibility. Verify the running environment. No external LLM API is required for the base workflow. Kokoro TTS is primary; Faster Whisper is optional. Do not deploy, commit, push, or incur paid API usage without authorization.
