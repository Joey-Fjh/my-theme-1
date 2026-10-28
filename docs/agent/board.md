# Work Board

The board is where work is discussed, researched and planned before it becomes a plan. Each topic carries its evidence, options and current leaning, and a status line (`discussing` or `awaiting user`, with the dates it was opened and last updated). When the user decides, the topic leaves the board in that change: into a plan in `docs/agent/context.md`, one line in `docs/agent/backlog.md`, a line under Pending migration, or deletion. Recording a plan does not authorize implementation. Project identity, scope, accepted direction, and overall status belong in `docs/project.md`; completed execution history belongs in Git.

Last updated: 2026-10-28.

## Topics

### SB1: one scrollbar style for the theme

Status: discussing · Opened: 2026-10-28 · Updated: 2026-10-28

The user liked the quick view's thin scrollbar (LS2-A, `38c1676`) and asked whether to make one shared style replace the native scrollbars, with its colour setting and behaviour to discuss (user, 2026-10-28).

Evidence (repo data, 2026-10-28):
- **Thin styled scrollbars, three owners, two colours:**
    - `.localization-menu` and `.product-info-blocks__description`: `scrollbar-width: thin`, `scrollbar-color: var(--color-line-strong) transparent`, a WebKit thumb, `scrollbar-gutter: stable`.
    - The quick view info: the same, but `var(--color-line)` (lighter) and no gutter.
    - `product-comparison-table`: `scrollbar-width: thin` only.
- **Hidden scrollbars:** 10 `scrollbar-width: none` rules plus 6 `no-scrollbar` uses (rails, tab strips, the quick view on mobile).
- **The page itself:** native scrollbar, with `scrollbar-gutter: stable` on `html` (`assets/base.css`).

Questions to settle:
- **Scope:** inner scroll areas only (dialogs, drawers, menus, descriptions, tables), or the page scrollbar as well? Restyling the page scrollbar is the riskier half: OS overlay scrollbars (macOS, mobile) ignore most of it.
- **Colour:** one fixed role (`--color-line` or `--color-line-strong`), or a merchant setting.
- **Behaviour:** always visible, or only on hover or scroll. Width. Whether the hidden-scrollbar places stay hidden (rails and tab strips usually do).
- **Mechanism:** one shared utility (for example `scrollbar-thin`) in `tailwind/tailwind.elements.css`, which the three owners adopt.

Current leaning: inner scroll areas only, one utility, `--color-line-strong` (the existing majority), always visible, no merchant setting. Rails and tab strips stay hidden. Not yet discussed with the user. Sources: own judgment, plus the repo inventory above. Shopify guidance still to be checked through Shopify Dev MCP when the topic is taken up.

### WT1: the Tailwind watcher misses imported CSS edits

Status: awaiting user · Opened: 2026-10-28 · Updated: 2026-10-28

Evidence (LS2-A, `git show 38c1676:docs/agent/context.md`):
- `npm run watch:tw` (`@tailwindcss/cli --watch`, started by the user's `concurrently "npm run shopify:dev" "npm run watch:tw"`) did not pick up edits to `tailwind/tailwind.components.css`, twice, including right after a restart.
- On the next `.liquid` edit it rebuilt `assets/tailwind.output.css` from its stale copy (identical to HEAD), which overwrote manual builds and failed an Ask review.
- **CI:** the failed CI run on `492bdc3` (2026-10-27, Lint, `git diff --exit-code -- assets/tailwind.output.css`: a stale `.pt-step-l`) is the same class of problem: a committed output that a fresh build does not reproduce.

Options:
- **A:** a pre-commit or pre-push check that runs `build:tw` and fails on a diff. The pre-push record check already exists; this mirrors the CI step locally.
- **B:** change `watch:tw`, for example watching `tailwind/**` explicitly or polling. Its success on Windows is unverified.
- **C:** both.

Leaning: A, because it catches every cause, not just this watcher. Both options change validator wiring (`package.json` scripts or the hooks), which the user owns.

Earlier topics closed. OS2 (optional sections design pass and heights) moved into plan OS2 in `docs/agent/context.md` with option B, 2026-10-28. LS2 (containers sized by content, and a layout and aesthetic pass) was planned with option B, 2026-10-27 (`git show 8cb6fe7:docs/agent/context.md`) and queued on `docs/agent/backlog.md` group 4 behind group 7. LS1 (media frame and section height) moved into plan LS1 with scope A+B, 2026-10-27, and closed in `37cff5e`; its board evidence is in `git show 4e0884d:docs/agent/board.md`, and C (the shared `section-frame` contract) folded into LS2. BP1 (sorting the consolidated browser pass) moved into plan BP1 in `docs/agent/context.md` with option 1, 2026-10-27; its moves and drops are recorded in `docs/agent/backlog.md` group 7. OS1 (optional sections, review risk) moved into plan OS1 in `docs/agent/context.md` with option A, 2026-10-27; its design items went to `docs/agent/backlog.md` group 6. PS1 (product info load shift) moved into plan PS1 in `docs/agent/context.md` with option A, 2026-10-27. PB1 (`promo-bannder` panel schemes) moved into plan PB1 in `docs/agent/context.md` with option C, 2026-10-27. Performance classification (backlog group 1) moved into plan L1 in `docs/agent/context.md` with scope A, 2026-10-26; its classification evidence is in the plan. CSS organisation (who owns spacing) moved into `docs/project.md` Accepted Direction as Spacing ownership, without primitives or lint, 2026-10-26. Content spacing (heading to action) moved into the B10 plan, 2026-10-25. The two `ritual-steps` style B topics moved into the B9 plan, 2026-10-25. B7 (`feature-tabs` markers) moved into the plan in `docs/agent/context.md`, 2026-10-25. (Packshot images decided 2026-10-23 and fixed in B6, `73aa65d`. Closed 2026-10-23 with no change, judged against official best practice: Stop hook scope, since the whole-worktree scan is the documented practice and parallel writers use separate worktrees; `mixed-element`, since B4's final commit displaced no CSS, the `:where(.own-class)` route exists, and the ban matches the unlayered section stylesheets; the `AGENTS.md` pass, see Deferred ideas. Evidence: git history of this file.)

## Pending migration

- **The board holds only choices the user can make now** (target `AGENTS.md`, Batch SOP step 7; user, 2026-10-21, narrowed 2026-10-23): design choices wait in the polish sections of `backlog.md`. (The other half, unfixed defects to one `backlog.md` line and notes only when the user names them, landed in `.agents/roles/verifier.md` with H9, `704bc35`.)

## Deferred ideas

- **`AGENTS.md` pass** (user, 2026-10-23): not now. The file is 173 lines (official target: under 200) and about 5.4k tokens; moving the sections needed only sometimes (Agent Adapters, Audit practice) saves about 550 tokens per session for 1.5 hours plus a review. Revisit on a real signal: a rule repeatedly ignored, or the file passing 200 lines; then handle that rule or section only.
- **Section cleanup sweep** (user, 2026-10-05): after the design phase, review unused sections in one batch. Keep: `custom-liquid`, `pickup-availability`, `collection-navigation-items`, social icons in `snippets/social-icons.liquid`.
- **Looping media video** (user, 2026-10-05): viewport-triggered play on `snippets/media-video.liquid` when a design needs it; WCAG 2.2.2 pause still required.
- **Home scroll narrative** (user, 2026-09-30): GSAP ScrollTrigger sections on demand via section modules; Three.js closed (2026-10-08). Constraints: motion reference classifies choreography; first frame in Liquid; `motion_enabled` and reduced motion; no full-page library load.
- **Lighthouse CI development themes** (user, 2026-10-13): the action never deletes its development theme (its cleanup tests a variable it never sets); left as is, revisit only if the leftovers cause a problem (then delete the run's own theme, not all development themes).
- **Carried (2026-10-13):** root size 62.5% has no primary-source endorsement with Tailwind; px body tokens ignore the user's default font size; revisit with the type token batch.

Harness history: H1 to H5 closed 2026-10-21 (`d31acef`, `aa14969`, `3503596`, `69151ad`, `b5a5ae1`); their discussion and evidence: `git show 69151ad:docs/agent/board.md`. H8 topic board (`3564715`); H9 plan and review weight (`704bc35`).
