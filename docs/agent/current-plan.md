# Current Plan

Current focus: stabilize the completed agent-governance reorganization and prepare the next pass for smoke tests and MCP planning.

Last updated: 2026-06-04.

## Active Structure

- Project skill entry point for Codex and Cursor: `.agents/skills/`
- Project validation scripts: task-specific `.agents/skills/*/scripts/`
- Agent current-context docs: `docs/agent/`
- Agent-readable references and patterns: `docs/references/`
- Claude Code automatic skill discovery is not a current project target; use manual file references or third-party integration when needed.

## Completed Today

- Removed the old top-level `skills/` source and moved shared references into `docs/references/`.
- Split validation tools into task-specific skills:
    - `check-css`
    - `check-i18n`
    - `check-theme-architecture`
    - `build-svg-icons`
- Moved deterministic validation resources into `.agents/skills/*/scripts/`.
- Updated `package.json` so `lint:*` and `build:svg` call the relocated skill scripts.
- Updated CI to run `npm run lint` instead of only `npm run format:check`.
- Added `docs/README.md` and clarified the boundary between `docs/`, `.agents/skills/`, skill-local `references/`, `scripts/`, `assets/`, and `llms.txt`.
- Fixed mojibake in `AGENTS.md` and `WORKFLOW.md` introduced during document edits.

## Next Topics

- Smoke-test `.agents/skills/` in Codex and Cursor.
- Confirm CI runs `npm run lint` in GitHub after the branch is pushed.
- Plan MCP configuration for Shopify Dev MCP, Playwright MCP, Figma MCP, and Chrome DevTools MCP in a separate pass.
- Decide whether to add optional skill UI metadata later; do not do it unless it clearly helps discovery.
