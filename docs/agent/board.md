# Work Board

The board is where work is discussed, researched and planned before it becomes a plan. Each topic carries its evidence, options and current leaning, and a status line (`discussing` or `awaiting user`, with the dates it was opened and last updated). When the user decides, the topic leaves the board in that change: into a plan in `docs/agent/context.md`, one line in `docs/agent/backlog.md`, a line under Pending migration, or deletion. Recording a plan does not authorize implementation. Project identity, scope, accepted direction, and overall status belong in `docs/project.md`; completed execution history belongs in Git.

Last updated: 2026-10-25.

## Topics

### CSS organisation from large to small: who owns what (first case content spacing)

Status: awaiting user · Opened: 2026-10-25 · Updated: 2026-10-25

**User positions (2026-10-25).** The container is the unit that owns and exposes spacing, top down; content inside it only owns its own properties (type size, line height, letter spacing, image fit) and never outer spacing; no granularity down to single content pieces. The distribution mode (`space-between`, `space-around` and so on) is not prescribed. No progressive enhancement (leading trim dropped). Open: land option A as the contract now, or keep it as accepted direction applied at the polish pass. Scope widened by the user the same day: not only spacing but the whole CSS organisation; purpose is to validate the user's model against mainstream practice (learning, like the harness round), not to build now.

**Mainstream check (2026-10-25).** ITCSS orders CSS from far-reaching to local (settings, tools, generic, elements, objects for undecorated layout, components, utilities). CUBE CSS: Composition owns layout, flow and spacing ("how elements interact with each other") and leaves colour, type and decoration to blocks; a block is skeletal because composition already did that work. Every Layout Stack: "style the context, not the individual element(s)"; margin is a property of the relationship between siblings; exceptions per element through custom properties; split with an `auto` margin. Braid: components carry no surrounding white space; layout components own direction and gap. Design tokens run primitive, then semantic, then component. Shopify: `{% stylesheet %}` CSS is scoped to the files that use it (stylesheet subsetting); merchant control goes through theme and section settings. Webflow and Framer put gap, padding and distribution on the container. Mapping to this project: settings chain and `css-variables.liquid` (settings), tokens and intents (primitive and semantic), `section-frame` and page grid (objects or composition), section stylesheets (blocks), Tailwind utilities (utilities). The missing piece was only the composition rule inside a block, which the user's model names.

**Question (user, 2026-10-25).** Colour, type and layout run through the settings chain and tokens; the space between pieces of content inside a block does not. B9 and B10 fixed it case by case (`svh` clamp, `em` after a display heading). Should content spacing become part of the framework and its application, controllable the way low-code builders make it, drawing on mainstream practice?

**Evidence.**
- What exists: the fluid step scale and four intents in `tailwind/tailwind.input.css` (`--spacing-tight`, `--spacing-related`, `--spacing-group`, `--spacing-section`) and `docs/design/design.md` (Spacing scale, plus the B10 `em` rule); `lint:theme` `stylesheet-spacing` counts raw values. Nothing says who owns a gap (parent or child), and sections mix `gap-*` utilities, stylesheet margins and leftover-space distribution (`space-between`).
- Mainstream code practice: the parent owns the space between its children (Every Layout Stack and Cluster, `gap` in component libraries); children carry no outer margins; exceptions are named per relationship (a split pushes one child away, `margin-block-start: auto`). Space after headings follows the type (`em`); leading trim (`text-box: trim-both cap alphabetic`, Chromium and Safari 18.2+, not Firefox) removes the line-height padding that makes gaps look uneven, as a progressive enhancement.
- Low-code builders: Framer stacks and Webflow flex or grid put gap and padding on the container and offer distribute modes; Shopify Horizon's group blocks expose gap, padding, direction and alignment on the container; Elementor has a global widget spacing plus per-widget overrides. Common pattern: the container owns a coarse, adjustable gap; global defaults; per-item overrides are rare.

**Options (scope, estimate, payoff).**
- **A (leaning).** Write the contract and the primitives, apply them per section at the polish pass. Contract in `docs/design/design.md` and `docs/references/style-system/css-architecture.md`: the parent stack owns the gap and picks an intent; children have no outer margins except a named relationship; after a display heading the space is in `em`; `space-between` or `space-around` only where the block fills a fixed height, never as the content gap. Primitives in `tailwind/`: a stack gap per intent and one display-heading spacing utility. About 2 to 3 hours plus an Ask review (reference and Tailwind change). Payoff: every later section fix uses the same few choices; no new merchant settings.
- **B.** A plus one global merchant setting, "content spacing" (compact, default, airy), scaling the four intents through the settings chain. About 2 more hours, Ask tier; touches every section's look at once. Payoff: the low-code style coarse control, one setting.
- **C.** B plus a content-gap setting on block-composed sections (Horizon style). Largest; grows the schema of many sections; the user already judged per-pair settings too fine.
- Optional with any: leading trim on display headings as a progressive enhancement (browser matrix check first).

Earlier topics closed. Content spacing (heading to action) moved into the B10 plan, 2026-10-25. The two `ritual-steps` style B topics moved into the B9 plan, 2026-10-25. B7 (`feature-tabs` markers) moved into the plan in `docs/agent/context.md`, 2026-10-25. (Packshot images decided 2026-10-23 and fixed in B6, `73aa65d`. Closed 2026-10-23 with no change, judged against official best practice: Stop hook scope, since the whole-worktree scan is the documented practice and parallel writers use separate worktrees; `mixed-element`, since B4's final commit displaced no CSS, the `:where(.own-class)` route exists, and the ban matches the unlayered section stylesheets; the `AGENTS.md` pass, see Deferred ideas. Evidence: git history of this file.)

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
