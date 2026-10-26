# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-26.

## Plan: spacing ownership as accepted direction

**Outcome.** The board topic "CSS organisation from large to small: who owns what" closes as one accepted-direction paragraph, "Spacing ownership", in `docs/project.md`. It is a way of thinking, not a rule set: no primitives, no lint, no theme code.

**Authorization.** The user approved the four-point text (option A′, without the `space-between` limit and with `em` for fine spacing) on 2026-10-26 ("可以啊"), and asked for the review on the same day. Two clarifications the coordinator folded in without changing the meaning: the container may name exceptions, such as pushing one child to the end; a reusable snippet counts as content to its parent.

**Dependencies.** None.

**Implementation surface.** `docs/project.md` (Accepted Direction, one new paragraph). Record files: `docs/agent/board.md` (topic removed, closure note), this file.

**Review tier.** Ask (`docs/project.md` is an agent-rule file).

**Estimate:** 30 minutes plus one review.

**Checkpoint:** after the paragraph and the board removal; report the diff and the validators.

**Bar:** Must fix: the paragraph contradicts the user's recorded positions (container owns spacing top down; content owns only its own properties; no per-content granularity; distribution mode not prescribed; no progressive enhancement), contradicts another rule in `AGENTS.md` or `docs/project.md`, prescribes a mechanism the user left open, or a validator fails. Accepted residue: wording and placement preferences. Input: the board topic as it stood (`git show HEAD:docs/agent/board.md`) and this record.

**Acceptance checks.**
1. `docs/project.md` Accepted Direction holds exactly one new paragraph, "Spacing ownership", and no other line in that file changes (`git diff docs/project.md`).
2. The paragraph names the three levels (page to section, section to container, container to content), leaves the mechanism open, gives content only its own properties plus type-bound fine spacing, and states `em` over fixed px for fine spacing.
3. The paragraph prescribes no specific distribution mode and adds no primitive, lint or theme code (`git diff --stat` shows only the three record or doc files).
4. `docs/agent/board.md` has no open topic, and the closure note names where the topic went (`npm.cmd run lint:records` reports `board topics: 0`).
5. `npm.cmd run lint:records`, `npm.cmd run lint:doc-paths` and `npm.cmd run doctor:agent` pass.

**Status.** Implemented 2026-10-26. Validators: `lint:records` (board topics: 0, pending migration lines: 1), `lint:doc-paths` passed, `doctor:agent` passed. Ask review (separate session, 2026-10-26): PASS, no defects; all five acceptance checks proven; the two coordinator clarifications judged to preserve the user's positions; no conflict with `AGENTS.md`, Design source, Design workflow or `design.md` (Spacing scale, B10 `em` rule); validators and `prettier --check` exit 0. Committed at the user's word, 2026-10-26.
