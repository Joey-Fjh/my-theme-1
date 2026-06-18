# External Skills Adoption Record

This file records which external sources have been reviewed, what was adopted, and what was rejected. It is an audit trail, not a runtime governance mechanism.

`AGENTS.md` remains the rule source.

## Adoption Boundary

- External skills are reviewed before installation.
- Only relevant patterns are extracted; irrelevant or conflicting content is rejected.
- Installed skills live in `.agents/skills/` as project-owned skills with source metadata in comments.
- External skills MUST NOT be installed into `.claude/skills/` or user-level directories.
- `AGENTS.md` overrides any installed skill in case of conflict.

## Adopted Skills

| External source | Installed as | Reviewed commit | What was adopted | What was rejected |
| --- | --- | --- | --- | --- |
| `garrytan/gstack` | `confusion-protocol` | [`cab774c`](https://github.com/garrytan/gstack/tree/cab774cced06e0a36b3b4b1518b8c968707f7e2f) (2026-06-04) | Confusion Protocol (stop on high-stakes ambiguity, present options, ask user), AskUserQuestion decision brief format | Multi-pass review architecture, Review Army, specialist dispatch, confidence calibration, fix-first pass, scope drift detection, slash-command surface, multi-role structure |
| `obra/superpowers` | `verify-architecture` | [`6fd4507`](https://github.com/obra/superpowers/tree/6fd4507659784c351abbd2bc264c7162cfd386dc) (2026-05-29) | RED-GREEN-REFACTOR verification mindset (define failure → minimal change → clean up), verification-before-completion gate (evidence before claims) | Full TDD cycle with mandatory test-first, subagent-driven development, executing-plans workflow, finishing-branch workflow, rigid "delete all code" rules |
| `anthropics/skills` | `frontend-design` | [`da20c92`](https://github.com/anthropics/skills/tree/da20c92503b2e8ff1cf28ca81a0df4673debdbf7) (2026-05-29) | Design thinking framework (purpose/tone/constraints/differentiation), typography guidance, color/theme systems, spatial composition, anti-AI-slop aesthetic blacklist | React/Motion library references, canvas-design, brand-guidelines, theme-factory, web-artifacts-builder |

## Not Adopted

| External source | Reason |
| --- | --- |
| `greensock/gsap-skills` | Core GSAP patterns already documented in `docs/references/architecture/motion-architecture.md`. No additional installation needed. Source reviewed at [`aed9cfd`](https://github.com/greensock/gsap-skills/tree/aed9cfd3277740755f6bfc1155c7aa645403b760) (2026-04-21). |
