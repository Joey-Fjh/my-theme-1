# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-12.

## 6-V4 Process calibration rule

**Status:** approved by the user 2026-10-12 (board proposal "Process calibration"); executed by the coordinator; external review PASS (reported by the user 2026-10-12); accepted, waiting for the commit.

**Outcome:** validation counts are always backed by a command, and executors never settle an open board decision.

**Review tier:** Ask (`.agents/roles/`).

### Items

1. `.agents/roles/implementer.md` Working method: take every count from a command's output and name the command; cite open board decisions only, stop and report when a task needs one decided. Task template item 4 repeats both.
2. `.agents/roles/verifier.md` Reviewer checklist: recompute every claimed count with a command (a count without one, or one that differs, is a finding); a change that settles an open board decision is a defect.

### Implementation surface

`.agents/roles/implementer.md`, `.agents/roles/verifier.md`.

### Acceptance checks

1. The four rules exist as written, in the named sections; nothing else in the two files changed.
2. `npm.cmd run lint:doc-paths` and `npm.cmd run doctor:agent` pass; `npx prettier --check` on both files passes.
3. The user's approval is recorded here.

### Progress

Executed 2026-10-12: items 1–2 written. `npx prettier --check` both files: pass; `lint:doc-paths`: pass; `doctor:agent`: exit 0.
