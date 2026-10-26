# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-26.

## Plan HP2: hero headline width (backlog group 4, part B)

**Outcome.** From 768 up the `slides-show` headline group spans two of the three grid columns (left and right positions) or all three (centre), so display words no longer break inside a word and the eyebrow no longer overlaps the call to action at 1024. When the caption sits in the same row, the headline keeps one column, as today.

**Decided (user, 2026-10-26).** Span the headline group only; the caption keeps one column; same-row fallback through `:has()`; CSS only.

**Evidence (coordinator, 2026-10-26, Chrome DevTools MCP).** The 48rem block in the section stylesheet (`.slides-show-section .place-*` with `grid-column-start`) overrides the earlier `grid-column: 1 / -1`, so the headline group gets one column: 238px at 768, 322px at 1024, 459px at 1440, against widest words of 365 to 408, 414 to 463 and 465 to 520px at the computed sizes; `word-break: break-word` then splits words ("SLOWE / R", "MORNI / NGS") and the taller group overlaps the caption row at 1024. The group also carries `max-w-3xl tablet:max-w-4xl` (560px from 768), which stays.

**Implementation surface.** `sections/slides-show.liquid` `{% stylesheet %}` only.

**Method.** In the 48rem block, add rules for `.slides-show__headline-group` only: left positions `grid-column-end: span 2`; centre positions `grid-column: 1 / -1` with centred self alignment; right positions start at column 2 and span 2 with end alignment. Then a fallback per row: when the grid `:has(> .slides-show__body)` in the same row (`place-top-*`, `place-center*`, `place-bottom-*`), the headline group in that row returns to its single column. No markup, schema or setting change.

**Review tier.** Show (stylesheet only).

**Estimate:** 30 minutes.

**Checkpoint:** after the screenshots, before the commit.

**Bar:** Must fix: a word split inside the default slides at 768, 1024 or 1440; the 1024 overlap; a change at 390; a same-row case overlapping where today it does not. Accepted residue: merchant headlines with a single word wider than 560px still break (as today). Judged on the default preset.

**Acceptance checks.**
1. Script at 768, 1024 and 1440: for every default slide, the headline group width is at least the widest word at its computed size, and no line box starts inside a word.
2. Same-row fallback: with a slide's classes switched in the DOM (caption `place-top-right` beside headline `place-top-left`, and centre beside centre-left), the headline group returns to one column and the two do not overlap.
3. 390 unchanged (group width and line count as before).
4. `npm.cmd run lint:theme`, `npm.cmd run scan:compat`, `npm.cmd run test:layout -- --widths 390,768,1024,1440` with 0 new issues.
5. Screenshots at 390, 768, 1024 and 1440 for the user.

**History.** Authorized by the user 2026-10-26 ("可以"); implemented by the coordinator in this session.

**Execution and validation (coordinator, 2026-10-26).**
1. Selectors find the two grid items by structure, not by class name, so `mixed-element` stays at 0: the headline group is `:has(.slides-show__headline)`; the caption is the second `[data-slides-show-text-motion]` sibling (`... ~ [data-slides-show-text-motion]`). A first attempt nested `:has()` inside `:has()`, which CSS rejects, so the fallback was dropped; caught by check 2 and replaced.
2. Check 1 (script, default slides): 768 group 476px against widest 365 to 408px; 1024 560px against 414 to 463px; 1440 560px against 465 to 520px; every slide 3 lines, no line break inside a word, no overlap with the caption (was 5 to 6 lines, words split, overlap at 1024).
3. Check 2 at 1440, classes switched in the DOM and restored: same row (top-left/top-right, top-left/top-center, center/center-left, top-right/top-left) gives one column and no overlap; different rows (bottom-right/top-left, center/bottom-left, top-left/bottom-left) keep the span; default `1 / span 2`.
4. Check 3: all new rules sit inside the `(width >= 48rem)` block; nothing below 768 changes.
5. Check 4: `lint:theme` passed; `scan:compat` passed; `test:layout -- --widths 390,768,1024,1440` 0 new issues; the section file diff is insertions only (formatted with Prettier, no other lines touched).
6. Check 5: screenshots at 1024 and 1440 shown to the user.

7. User look (Show tier): accepted 2026-10-26 ("我看过了，没有什么问题").

**Status.** Executed and reviewed; waiting for the commit, then this plan is cleared.
