# Agent-Readable Docs

This directory is the shared knowledge layer for agents working in this repository.

Use `docs/` for durable context that is useful to agents but too large, too contextual, or too cross-cutting to live directly in `AGENTS.md` or a single `SKILL.md`.

## Directories

- `agent/`: Agent context and next-session template.
- `references/`: Shared references, architecture details, canonical implementation examples, and long checklists that may be read on demand.
    - `architecture/`: Runtime, motion, and abstraction-boundary references routed from `AGENTS.md`.
    - `agent-workflow/`: Collaboration standard, task routing, third-party skill governance, and task frame references routed from `AGENTS.md`.
    - `style-system/`: CSS, typography, color/surface, image display, inline style, z-index, and SVG icon references routed from `AGENTS.md`.
    - `patterns/`: Canonical implementation examples.
    - `code-review/`: Review checklists, i18n references, and launch-gate references.

## Boundaries

- `AGENTS.md` remains the repository rule source.
- `docs/references/agent-workflow/` remains the shared collaboration, routing, and external skill governance reference.
- `.agents/skills/` remains the single source of truth for project Agent Skills.
- Tool-specific entry points may use relative symlinks to source files or directories. Current examples are `CLAUDE.md` -> `AGENTS.md` and `.claude/skills/` -> `../.agents/skills`.
- `docs/references/` may be referenced by skills, but docs do not automatically trigger skills.
- Skill-local `references/` should be used only for material strongly owned by one skill.

If a doc conflicts with `AGENTS.md`, follow `AGENTS.md`.
