# Documentation Audit

Scope: full agent-readable documentation scan for stale content, architecture mismatch, excessive file length, and entry/skill routing coverage.

## External Reference Principles

- Keep entry files short: repository rule source, routing, and critical guardrails only.
- Keep skills executable: trigger, workflow, docs to read, guardrails, and validation choice.
- Put long-lived project knowledge in `docs/references/`, not in skills or `context.md`.
- Split broad references when one file combines unrelated contracts, historical notes, and checklists.

## Completed

- `AGENTS.md`: validation commands now use `npm.cmd`; style-system routes now include CSS history, image display, typography, color/surface, and SVG icon references.
- `.agents/skills/*/SKILL.md`: validation commands aligned to `npm.cmd`; corrupted characters removed; long method text reduced in `frontend-design` and `verify-architecture`.
- `docs/agent/context.md`: reduced to short relay; old UX batch state removed; five current theme-experience tracks retained.
- `docs/references/style-system/css-architecture.md`: reduced from a phase-history monolith to the current CSS token/layer/bridge contract.
- New split references:
  - `css-architecture-history.md`
  - `image-display-contract.md`
  - `typography-reference.md`
  - `color-surface-reference.md`
  - `svg-icon-pipeline.md`
- Existing `css-and-typography.md` is now the style-system index instead of a 500+ line mixed reference.
- `launch-gate.md`, `javascript-runtime.md`, and `canonical-css-layering.md`: validation command examples aligned to `npm.cmd`.

## Verified

- No corrupted text matches for the mojibake marker search used during audit.
- No old UX batch markers found.
- No plain npm script command remains except the intentional `context.md` reminder to use `npm.cmd`.
- `git diff --check -- AGENTS.md docs .agents/skills` passes.

## Intentional Retention

- `data-component-kind` examples remain because the current paired `Components.register` sections still use it.
- `javascript-runtime.md` remains a single 300-line API reference for now; it is cohesive enough to keep until JS runtime work resumes.
- `motion-architecture.md`, `launch-gate.md`, `i18n-checklist.md`, and `canonical-accessibility.md` remain longer references because they are domain checklists, not entry files.

## Follow-Up Candidates

- If JS architecture resumes, split `javascript-runtime.md` into runtime APIs, Alpine patterns, and anti-patterns.
- If launch QA resumes, consider splitting `launch-gate.md` into accessibility, repo safety, and pre-merge gates.
- If i18n work grows, split `i18n-checklist.md` into locale structure and audit checklist.
