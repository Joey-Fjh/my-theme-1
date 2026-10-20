# Work Board

This board holds only what is not yet decided: open decisions, evidence that has not become a plan, rules awaiting migration, deferred ideas, and the active harness round. Accepted work that no batch has scheduled yet lives in `docs/agent/backlog.md` (one line per item). `docs/agent/context.md` holds the plan under execution, or no plan; extra plans may coexist only when each is executed and waiting on verification the agent cannot perform (`AGENTS.md`, Record-layer checks). Recording a plan does not authorize implementation. Project identity, scope, accepted direction, and overall status belong in `docs/project.md`; completed execution history belongs in Git.

Last updated: 2026-10-21.

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

- **Cursor and Codex hooks** (harness round, 2026-10-20): configured later from each client; feasible shape is one shared script under `.agents/tools/` with a thin per-client config (Cursor cannot inject context at prompt submit and fails open unless `failClosed`; Codex has no `ask` and exposes edits as `apply_patch` text). The `AGENTS.md` routing tables shrink only once both clients have hooks, or once the tables are generated from `routes.json`.
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

Closed 2026-10-21: H1 record layer (`d31acef`), H2 Claude Code hooks and record checks (`aa14969`), H3 CI merchant-path guard (`3503596`), H4 prose slimming and the bundled Pending migration (`69151ad`); follow-up H5 pre-push check (`b5a5ae1`). Discussion, evidence and transcript statistics: `git show 69151ad:docs/agent/board.md`.
