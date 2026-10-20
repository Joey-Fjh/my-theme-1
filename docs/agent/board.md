# Work Board

This board holds only what is not yet decided: open decisions, evidence that has not become a plan, rules awaiting migration, deferred ideas, and the active harness round. Accepted work that no batch has scheduled yet lives in `docs/agent/backlog.md` (one line per item). `docs/agent/context.md` holds the plan under execution, or no plan; extra plans may coexist only when each is executed and waiting on verification the agent cannot perform (`AGENTS.md`, Record-layer checks). Recording a plan does not authorize implementation. Project identity, scope, accepted direction, and overall status belong in `docs/project.md`; completed execution history belongs in Git.

Last updated: 2026-10-20.

## Open decisions

- **Gap found in 6-P1 (2026-10-15, discussion only):** criterion 2 of the CSS readiness definition extends lints to raw spacing in sections, but only markup utilities are covered (`raw-spacing`). Raw `padding`, `margin` and `gap` in `{% stylesheet %}` pass unchecked; 6-P1 used literal `clamp()`s and 23 Liquid files already hold `clamp()` in stylesheet blocks. No direction chosen yet.
- **`impeccable` adoption (home critique filed 2026-10-15):** a separate-session `impeccable` 4.5.2 critique of the home page is under Evidence. Whether to act on its ranked issues (page order, hero line break, mobile heading priority, testimonial marquee, accent panel) is not decided. `impeccable` is not vendored (user, 2026-10-13).
- **Polish design choices, decided at the polish pass:**
    - Serif heading face: the design shows one on many sections while `design.md` fixes one family; one theme-wide font decision (6-S8, 6-S9, 6-S11, 6-P1 to 6-P4).
    - Hero CTA underline: `slides-show` shows the line on hover or focus only (`link` `variant: 'underline'`), the design and `design.md` Arrow link a resting line (6-S4 review, 2026-10-05).
    - Product page add to cart: toast only, or open the cart drawer like quick view (`open_cart_on_add` in `snippets/buy-buttons.liquid`; live theme the same; 2026-10-13).
    - Section heights: whether sections other than hero-type keep a set distance from a full screen (user, 2026-10-03; decided with the home redesign).
    - Card hover depth: whether product cards get the same raised hover as collection cards (card surface batch, user 2026-10-05).
    - Per-scheme `badge_*` colours (`snippets/css-variables.liquid`) have no consumer since 6-S4: retire them or not (schema removal, Ask tier).
- **Lighthouse CI leftovers (user's choice, 2026-10-13):** remove the `lighthouse-ci` Dev Dashboard app and the secrets `SHOP_CLIENT_ID` and `SHOP_CLIENT_SECRET`, unused since the Theme Access change, or keep them.
- **Layout harness page-margin rule (decide in a later harness plan; 6-T1 cross review 2, 6-C2, 2026-10-08):** a scroller item fully in the viewport but inside the page margin, cut by its own scroller, is still reported (2 `collection-all` nav-link entries); a scrollport-visibility exclusion would change the rule. Second case: `ritual_steps_carousel` mobile card 2 product title at 768 (the sweep never tests 768; not baselined, user's choice).

## Pending migration

## Evidence

- **`impeccable` 4.5.2 home critique (2026-10-15, read-only, report in chat only):** original language exists but page order dilutes it. Ranked: (P1) three `promo-bannder` panels then two `ritual-steps` read as a catalogue; (P1) `slides-show` "MORNINGS" line break at 1440; (P2) inverted heading priority at 390; (P2) `testimonial-featured` clipped side cards on mobile; (P2) full bright accent on a `promo-bannder` panel (may be scheme config). Against `design.md`: accent area misuse, header layout, mobile rails, hero CTA underline, solid buy buttons, small ritual headings. Detector output is advisory; shortening narrative touches accepted composition. Adoption is an open decision above.

## Deferred ideas

- **Check candidates from H4 (2026-10-20):** a global DOM listener inside a Liquid `{% javascript %}` block (`executable-inline-script` matches only `<script>` bodies); preset or block values equal to the schema default, and empty block `settings` objects, are not required to be omitted. Prose stays until a check exists.
- **`test:layout` in CI (6-T4b)** (user, 2026-10-13): trial on `ci-test` stopped at page discovery; build when `main` can change without a local layout check. Detail: `git show 9d366d5:docs/agent/board.md`.
- **Base scales and design pipeline (Stitch):** set scales from the base design through an agent-era tool, not hand-picked numbers; tool and SOP when the pilot starts (user, 2026-10-08). Until then tokens keep today's rendered values.
- **Platform-agnostic front-end engineering skill** (user, 2026-10-11): extract non-Shopify-specific harness patterns after two consumers; needs explicit approval to create a skill.
- **Section cleanup sweep** (user, 2026-10-05): after the design phase, review unused sections in one batch. Keep: `custom-liquid`, `pickup-availability`, `collection-navigation-items`, social icons in `snippets/social-icons.liquid`.
- **Looping media video** (user, 2026-10-05): viewport-triggered play on `snippets/media-video.liquid` when a design needs it; WCAG 2.2.2 pause still required.
- **Home scroll narrative** (user, 2026-09-30): GSAP ScrollTrigger sections on demand via section modules; Three.js closed (2026-10-08). Constraints: motion reference classifies choreography; first frame in Liquid; `motion_enabled` and reduced motion; no full-page library load.
- **Lighthouse CI development themes** (user, 2026-10-13): the action never deletes its development theme (its cleanup tests a variable it never sets); left as is, revisit only if the leftovers cause a problem (then delete the run's own theme, not all development themes).
- **DesignSync** (user): `/design-sync` for claude.ai/design token previews; does not build CSS.
- **Carried (2026-10-13):** whether the second submission waits for the design pipeline or ships with today's values plus the polish pass.
- **Carried (2026-10-13):** sites reviewed (Refero, Lovart, Stitch, Godly, Dribbble, Pinterest, React Bits, Aceternity, MotionSites, Uiverse, Utopia, ecomm.design, Commerce Cream, Baymard, Typewolf, Realtime Colors, Theme Store).
- **Carried (2026-10-13):** root size 62.5% has no primary-source endorsement with Tailwind; px body tokens ignore the user's default font size; revisit with the type token batch.

## Harness round

Next plan after H1: H2 hooks and checks (Claude Code only). Discussion closed on direction (user, 2026-10-20); no objection to two Ask-tier batches (H1 record layer, then H2).

- **Evidence:** this board reached about 9,600 words and grew back three days after the 2026-10-13 prune; its product page line stayed stale for five days and misled the coordinator on 2026-10-20; skills and prose skill triggers in `AGENTS.md` take effect only when the model reads them.
- **Agreed direction:** rule content (lint scripts, skills) stays in the project; Claude Code hooks decide timing (`UserPromptSubmit` coarse pointer; `PreToolUse` / `PostToolUse` path- or diff-based skill pointers and per-file lint; `Stop` diff-scoped validators and record checks). Pointers once per session, not skill bodies. CI and branch protection stay the hard gate. Harden decidable rules first, then hooks, shrink prose only after enforcement elsewhere.
- **Decided (user, 2026-10-20): no git hooks.** Other clients use their own hooks if adopted; gaps fall back to CI.
- **Client hook support (read-only subagent, 2026-10-20):** Claude Code, Cursor and Codex CLI all have project-level hooks (start, prompt, before/after tool, stop, subagent stop, compaction). Cursor cannot inject at prompt submit, ignores `ask` in `preToolUse`, fails open unless `failClosed`; Codex has no `ask` and exposes edits as `apply_patch` text. Feasible: shared script under `.agents/tools/` plus thin per-client config.
- **Transcript statistics, this machine (read-only subagent, 2026-10-20; 8 Claude coordinator sessions 09-24 to 10-13, 8 Codex after 09-24; gaps 10-01 to 10-07 and after 10-13 17:54):** `Skill` tool once (not a project skill); validators via npm (`lint:theme` 72, `lint:doc-paths` 83, `test:layout` 23 in Claude sessions); `review-animations` after 6-V7 with unmeasured motion commits; GSAP skills 0 reads; `frontend-design` 0 reads after 09-24; record files dominate traffic; record writes mostly shell (`context.md` 159 shell vs 56 Edit/Write); `lint:theme` failures cluster on Alpine syntax (~20) and type/colour bypasses (~16).
- **Transcript statistics, home machine (coordinator, 2026-10-20; 19 Claude coordinator sessions 09-24 to 10-15, 7 in the first sample's gaps; Codex only guardian-review threads, none counted):** `Skill` tool 0; skill file reads: `check-theme-architecture` 58, `frontend-design` 8, `review-animations` 3, `gsap-core` 2, `gsap-scrolltrigger` 1, `check-i18n` 1; validators: `lint:theme` 202, `lint:doc-paths` 182, `test:theme-check` 116, `build:tw` 106, `doctor:agent` 88, `test:layout` 74; record writes even more via shell (`context.md` 91 Edit/Write vs 477 shell); references led by `css-architecture.md` 192; visible `lint:theme` failures ~13 lines (no Alpine failures in this sample).
- **Per-section classification (read-only subagent, 2026-10-20; ~7,440 words estimated):** A existing check 2,158; B decidable path 2,393; C no trigger 1,555; D duplicated/stale 1,330. `AGENTS.md` Batch SOP and Record-layer checks are mostly C; skill `SKILL.md` files largely restate checkers. Drift where references copy `{% doc %}` tables; migration markers remain. Draft path-to-action mapping exists; undecidable rows include `lint:liquid-syntax`, `test:layout`, release gates, `frontend-design`, Theme Store completeness.
- **Decided (user, 2026-10-20): subagents follow Batch SOP** (propose role, client, model, wait); candidate `ask` on subagent spawn after verifying tool name in Claude Code docs.
- **Agreed in principle (user, 2026-10-20):** `Stop` record checks when a record file changed or a commit landed since last check; structural violations block, counts prompt; board size ratchet baseline is post-H1 cleanup; checks include no completion records, `Last updated` freshness, `context.md` plan count, `backlog.md` one line per item with source, pending-migration count.
- **Decided (user, 2026-10-20): Claude Code hooks first;** Cursor and Codex later per client.
- **H1 (record layer):** closed 2026-10-20 (`d31acef`).
- **H2 (Claude Code hooks and record checks):** closed 2026-10-20 (`aa14969`). `PostToolUse` per-file `lint:theme` not added: one full run takes about 10 to 16 s.
- **H3 (CI merchant-path guard, reference table pointers):** closed 2026-10-20 (`3503596`, CI run 39450026571 green).
- **H4 (closes the round, user 2026-10-20):** implemented 2026-10-20, awaiting review. Plan in `docs/agent/context.md`.
- **Deferred within the round:** shrink `AGENTS.md` routing tables until Cursor and Codex have hooks or tables are generated; Cursor and Codex hook configs.
