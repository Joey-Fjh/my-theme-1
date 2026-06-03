# Next Session

Use this file for durable next-session notes that future agents should inspect before continuing.

## Current State

- Agent governance has been reorganized around `AGENTS.md`, `.agents/skills/`, and `docs/`.
- Project agent entry points are `AGENTS.md` and `.agents/skills/`.
- `docs/` is the shared agent-readable knowledge layer; `docs/references/` stores cross-skill references and canonical examples.
- Validation tools are split into task-specific `.agents/skills/*/scripts/` resources and are still invoked through `package.json`.
- Root `llms.txt` is intentionally not used for repo-internal agent governance; reserve it for public website or documentation indexing.
- MCP setup is intentionally deferred to a later pass.
- `.claude/settings.json` is local or third-party Claude configuration and is not a project skill discovery layer.

## 2026-06-04 Session Notes

- Current phase: Governance reorganization is structurally complete; next phase is smoke testing and MCP planning.
- Objective: Keep multi-agent rules and skills stable without affecting storefront runtime behavior.
- Files changed: agent governance docs, `.agents/skills/`, `docs/`, CI, ignore files, and `package.json` command paths.
- User decisions: Prefer `.agents/skills/` for Codex/Cursor; do not maintain `.claude/skills/`; keep long shared references in `docs/references/`; split validation skills by task intent; do not create root `llms.txt` now.
- Checks run: `npm run lint:css`, `npm run lint:i18n`, `npm run lint:theme`, `npm run lint`, old-path searches, skill frontmatter checks, mojibake search, and `git diff --check`.
- Known blockers: None. `git diff --check` still reports the existing `.gitignore` CRLF/LF warning.
- Runtime risk assessment: No theme runtime directories were modified (`assets/`, `sections/`, `snippets/`, `templates/`, `config/`, `locales/`); storefront behavior should be unaffected by this reorganization.
- Next recommended prompt: "Smoke-test `.agents/skills/` in Codex/Cursor, then plan Shopify Dev MCP, Playwright MCP, Figma MCP, and Chrome DevTools MCP integration."

## Next Session Template

- Current phase:
- Objective:
- Files changed:
- User decisions:
- Checks run:
- Known blockers:
- Next recommended prompt:
