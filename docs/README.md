# Agent-Readable Docs

This directory is the shared knowledge layer for agents working in this repository.

Use `docs/` for durable context that is useful to agents but too large, too contextual, or too cross-cutting to live directly in `AGENTS.md`, `WORKFLOW.md`, or a single `SKILL.md`.

## Directories

- `agent/`: Current plan, durable decision log, and next-session notes.
- `references/`: Shared references, canonical implementation examples, and long checklists that may be read by multiple skills.

## Boundaries

- `AGENTS.md` remains the repository rule source.
- `WORKFLOW.md` remains the shared process source.
- `.agents/skills/` remains the discoverable Agent Skills entry point.
- `docs/references/` may be referenced by skills, but docs do not automatically trigger skills.
- Skill-local `references/` should be used only for material strongly owned by one skill.

If a doc conflicts with `AGENTS.md`, follow `AGENTS.md`.
