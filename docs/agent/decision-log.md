# Decision Log

- Use `AGENTS.md` as the canonical repository rule source.
- Use `WORKFLOW.md` as the shared process and handoff protocol.
- Use `.agents/skills/` as the standard project skill adapter entry for Codex and Cursor.
- Do not maintain `.claude/skills/` as a project discovery layer for now.
- Claude Code is not a current first-class automatic skill discovery target; use manual file references or third-party integration when needed.
- Move project validation scripts into task-specific `.agents/skills/*/scripts/` resources.
- Keep `package.json` scripts as the stable command API for humans, agents, CI, and future hooks.
- Store canonical implementation examples in `docs/references/patterns/`.
- Store review checklists in `docs/references/code-review/`.
- Use `docs/agent/` for current context, decision logs, and next-session notes.
- Use `docs/references/` as the shared agent-readable knowledge layer for cross-skill references, canonical examples, and long checklists.
- Use skill-local `references/...` only for material strongly owned by one skill.
- Do not migrate `docs/references/` into skills just to mirror the full Agent Skills directory shape.
- Do not add root `llms.txt` for repo-internal agent governance; reserve it for public documentation or website indexing.
- Use repo-root relative paths for cross-directory references.
- Use skill-local `scripts/...` paths for deterministic resources owned by a skill.
