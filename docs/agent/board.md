# Work Board

This board holds only what is not yet decided: the one active decision, evidence that has not become a plan, and deferred ideas. `docs/agent/context.md` holds exactly one accepted plan during execution, or no plan. Recording a plan does not authorize implementation. Project identity, scope, accepted direction, and overall status belong in `docs/project.md`; completed execution history belongs in Git.

Last updated: 2026-10-09.

## Open decisions

**Done: 6-C1 to 6-C4.** 6-C1 to 6-C3 in `2bd5533` (migration ratchet, breakpoint tokens and hover variants, loaded weights only). 6-C4 accepted by the user 2026-10-09 after independent review round 3 PASS and the browser look (layered colour tokens: alpha steps, roles re-declared per scheme, scrims, three shadows, `raw-colour` and `colour-role-sync` lints, `scan:contrast`; plan and review rounds: `git show 6b439ca:docs/agent/context.md`). Contracts: `docs/references/style-system/css-architecture.md`. 6-V2 done 2026-10-09 (review round 2 PASS; plan and reviews: `git show 2e9e016:docs/agent/context.md`): `js-custom-event`, `js-section-mutation`, `dead-setting` (0 dead settings; three dynamic-access files reported as unprovable) and three reference fixes. 6-C5 done 2026-10-09 (review round 3 PASS after two FAIL rounds on the new lints; plan and reviews: `git show 0ec8c90:docs/agent/context.md`): one named page grid (`--page-grid-columns`, `--page-inset`), `--screen-height`, lints `page-token-scope`, `screen-height-literal`, `frame-full-allowlist`, the `grid-feature-card` `sizes` fix, and one pre-existing `ritual-steps` rail entry added to the layout baseline (user, 2026-10-09). 6-C7 done 2026-10-09 (`710ab97`; plan and review: `git show 710ab97:docs/agent/context.md`): nine-step fluid space scale `step-3xs`..`step-3xl` with aliases `tight`, `related`, `group`, `section`; no visual change; old-to-new table in `css-architecture.md`. 6-C8 done 2026-10-10 (`1cc513e`; plan and reviews: `git show 1cc513e:docs/agent/context.md`): eleven-step fluid type scale, `title-*` / `copy-*`, legacy tiers as aliases, 8 heading and 4 body merchant options with 61 saved values migrated. 6-C9 done 2026-10-10 (`4ed4278`; plan and reviews: `git show 4ed4278:docs/agent/context.md`): five schemes (Sage and Page added, values provisional), card role, standalone colour settings moved to roles, `colour-setting` lint. **The CSS specification batches are complete.** Next: the parked discussions (6-C6 stylesheet ownership, the design-tool and Figma value pilot), then the product page and the polish pass.

**Filed, pre-existing (found in the 6-C9 review, 2026-10-10):** the `product` section setting `zoom_overlay_opacity` (image lightbox backdrop) has no visible effect: the backdrop's inline opacity is overridden by the open animation in `tailwind/tailwind.animates.css`, which settles at opacity 1 (same on HEAD). Fix or remove the setting with the product page work.

**Filed for the Lighthouse pass:** `snippets/product-info-blocks.liquid` `sizes` uses `var()`, which `sizes` cannot resolve, so the browser falls back to `100vw`.

**Decided: 6-C6 direction** (user, 2026-10-09; replaces the layering plan under "Conclusion, step 1"). **Parked** (user, 2026-10-09): 6-C7, 6-C8 and 6-C9 run first; once CSS reaches the readiness standard, this batch and the parked design-tool discussion are taken up together, before the product page and the polish pass.
- **Organizing principle (user):** CSS mirrors the JS runtime. `tailwind/` is the always-loaded shared layer (like `base.js` and the core modules); each file's `{% stylesheet %}` is the on-demand layer (like a feature module mounted by `data-module-id`). Shopify confirms the mechanism: it collects `{% stylesheet %}` content into one `styles.css` and subsets it so each page loads only the files in its render tree (shopify.dev, "Stylesheet content subsetting"). One question places any CSS: shared by 2+ unrelated owners → `tailwind/`; otherwise → the owner's stylesheet. Utilities in markup only consume the shared vocabulary.
- **Purpose of `{% stylesheet %}`:** keep `assets/tailwind.output.css` from growing without bound. Shared vocabulary (tokens, tiers, components with 2+ unrelated consumers) lives in the Tailwind build; styles one section, block or snippet owns live in its stylesheet, which Shopify loads only where the owner renders. 5-C1 and 5-C2 moved the rules; two parts were never discussed and are this batch.
- **Gap 1, priority differs by file:** 5-C1 kept the 161 moved rules in their origin layer for parity, so 25 stylesheet blocks are wrapped (37 wrappers: 10 `@layer components`, 27 `@layer snippets`) and lose to utilities, while the 38 written later are unlayered and win. Layer order: `theme, base, components, snippets, utilities`.
- **Gap 2, utilities in markup:** the 5-C3a "CSS homes" rule splits by concern (utilities for layout, stylesheet for states), so one element mixes both. Measured (coordinator script, rough): 1489 class attributes in sections and snippets; 796 utilities only, 215 own classes only, 115 mixed; about ten same-property overlaps (for example `featured-products__tab` with `px-0`, `scroll-categories__grid` with `flex gap-9`, `article-hero__content` with `px-6`).
- **Direction:**
    - **Priority:** every stylesheet is unlayered and wins over utilities; the 25 wrappers are removed after an overlap audit of those files, with a computed-style and geometry parity check; a lint rejects `@layer` in `{% stylesheet %}`. The `snippets` layer name leaves the order statement.
    - **Ownership (rule B):** an element with its own class gets all its styles from its stylesheet, tokens through `var()`; utilities only on elements without an own class; classes generated from merchant settings stay in markup and the stylesheet never sets their property. Replaces the 5-C3a "CSS homes" row for utilities. Existing mixed elements migrate section by section in the polish pass; new and changed code follows it at once.
- **Added (user, 2026-10-10):** font sizes are a tiered system, so they must not scatter: a stylesheet `font-size` uses `var(--type-step-*)` or a relative value (`inherit`, `em`, `%`) only. A lint enforces it with a ratchet baseline (today 16 absolute declarations in 9 files, 12 of them `calc(var(--font-heading-scale) * Nrem)`, which the current settings-chain lint accepts); the polish pass migrates them. Spacing keeps only the `raw-spacing` ratchet: layout utilities have no tier rule yet, so scattering there is tolerated.
- **Next:** the coordinator runs the three-part audit for this scope and proposes the plan.

**Decided: audit practice** (user, 2026-10-09).
- **Per CSS batch:** the scope discussion runs a three-part audit of its domain (bypasses of the chain, redundant or leftover code, rule holes). Findings go into the plan; the batch's baseline is cleared when it closes. 6-C4 is the first.
- **Before the second submission:** one cross-domain consolidation pass (the polish pass plus the readiness review).
- **Closed areas no later batch revisits** (JS runtime and modules, i18n, schema and settings, assets, `docs/references/` accuracy): one read-only audit by an external session (Sonnet), report outside the repo; the coordinator files the findings here by domain.
- **Finding during the 6-C4 discussion (resolved 2026-10-09; the order list above now says what was built):** the board lists 6-C1 as eight lints and marks it done, but commit `2bd5533` implements three (type tiers, raw spacing, `pc:` / `fw:`; 6-C2 added the media query lint and 6-C3 the weight lint). Not implemented and not recorded as dropped: hex / `rgb()` / `color-mix()` in section stylesheets, viewport units and `--page-width` / `--page-margin` in section stylesheets, dead settings. 6-C3 also went the other way from its line in the order (`font-medium` → `font-normal` instead of loading a 500 face); the Done line records the result but not the decision. The colour lint goes into 6-C4; viewport / page width belongs to 6-C5; dead settings has no owner yet.
- **Closed-area audit, done** (external Sonnet session, 2026-10-09; report not kept, the findings are filed below; 4 BYPASS, 4 LEFTOVER, 8 RULE HOLE, 2 UNPROVEN; it ran before 6-C4 Part A, so its `lint:theme` pass predates `raw-colour`). Filed by owner; the coordinator spot-checked the doc findings.
    - **6-C5 (already planned there, confirmed):** the four viewport-height bypasses (`featured-product`, `promo-bannder`, `ritual-steps`, `routine-showcase`) and the missing viewport-unit lint.
    - **6-T4 (CI):** `test:layout` is required by `AGENTS.md` but not in CI; CI needs a runner strategy for the dev server.
    - **Validator batch 6-V2:** done 2026-10-09 (see the Done line above).
    - **Record fix (coordinator):** done 2026-10-09 (6-C1 and 6-C3 lines in the batch order).
    - **No action:** `gift-card.js` listener skip is a documented exception; `motion-reveal.js` size is the known deferred motion item; only English locales exist (a release or Theme Store question, not a code leftover); hard-coded Liquid copy beyond the validators is UNPROVEN, reviewed per new section.

**Decided: CSS batch order** (proposed by the coordinator, accepted by the user 2026-10-08; 6-C5 is the full version, not the slimmed 6-F1; the product page design runs in parallel, see the open item below; user direction: the full specification, not a slimmed one; small and fast batches first; no manual browser sweeps that a tool can do; product page design work may arrive in between). Supersedes the order under "Specification discussion closed". Calibration stays deferred to the design pipeline; tokens keep today's values.
1. **6-C1 lints with baselines** (as built in `2bd5533`): old type tier names, raw spacing utilities, `pc:` / `fw:`, each a ratchet that may only fall. The rest of the original list moved: media query spellings to 6-C2, weights to 6-C3, colour literals to 6-C4 (`raw-colour`), viewport units and `--page-width` / `--page-margin` to 6-C5, dead settings to the validator batch below.
2. **6-C2 breakpoints:** `tablet` / `desktop` / `wide` tokens, `can-hover` / `no-hover`, hand-written media queries replaced, `pc` / `fw` as aliases. No visual change.
3. **6-C3 loaded weights only** (as built in `2bd5533`): `font-medium` → `font-normal`, `font-semibold` → `font-bold`, matching the faces already loaded, with no visual change, and a lint rejects other weights. Choosing an emphasis (medium) weight and the accent font role is **not decided**; it belongs to the font discussion with 6-C8 (user, 2026-10-09).
4. **6-C4 derived colour tokens and scrims**, plus the contrast script. No visual change, or one within the listed tolerance.
5. **6-C5 page frame** (6-F1 revised in full: named-line page grid, a cover height token, the four sections with their own heights).
6. **6-C6 stylesheet ownership** (direction replaced 2026-10-09, see "Decided: 6-C6 direction" below): every `{% stylesheet %}` unlayered so it wins over utilities, and an element with its own class keeps all its styles in the stylesheet.
7. **6-C7 space scale** and **6-C8 type scale** with semantic aliases and the old-to-new tables.
8. **6-C9 schemes and standalone colour settings** (needs approval for `config/settings_data.json` and the schema IDs).
9. **Polish pass**, per section: migrate raw values, old names and `pc:` to the scales and `desktop`. The product page is the pilot (readiness criterion 4). If its design arrives earlier, it is built on the tokens that exist then, and migrated here.

**Decided: the product page runs alongside the CSS batches by interleaving (option A)** (user, 2026-10-08).
- **Constraints:**
    - one writer per shared worktree;
    - `context.md` holds one plan under execution at a time.
    - Both tracks touch shared files: tokens in `tailwind/`, `snippets/css-variables.liquid`, the product sections, and the purchase snippets.
- **Options:**
    - interleave product page batches between CSS batches (no rule change);
    - a second git worktree and branch for the product page, with its own agent and record, merged later (a process change: two records and merge conflicts in shared files).
- **Decided (user, 2026-10-08):** A. Product page batches go between CSS batches in the same worktree, preferably after 6-C7 and 6-C8, so they use the new tokens.

**Decided: 6-T2 stopped, verification stays light** (user, 2026-10-08):
- **Why:** the question was necessity, not run time. People still look at the pages; automation only has to be light, and cut later agent cost.
- **State:** the pixel comparison was never finished, and its uncommitted code was deleted. Nothing of it remains in Git or the working tree.
- **Per CSS batch from now on:**
    - the lints;
    - `test:layout` at a few key widths (`--widths`, for example 390,768,1024,1440);
    - the user's browser look at the pages and widths the plan names.
    - The full 57-width sweep runs before a release.
- **Accepted as a candidate (user):** Shopify's official Lighthouse CI GitHub Action, with the CI item (6-T4).
- **Open, later:**
    - 6-T3, the interaction suite;
    - 6-T4, CI;
    - a computed-style comparison, only if a batch such as 6-C6 proves to need it.

**Decided: order of work** (user, 2026-10-08):

1. **First:** finish this repository: the CSS specification batches, JS, lint, CI, best practices and Shopify's official constraints.
2. **Then:** the skeleton backport.
3. **After it:** the design-tool pipeline (Stitch or similar), run in batches and automated under the harness.

**Consequences:**
- **Token batch:** it builds the mechanism (scale structure, semantic aliases, settings chain, lints) with values mapped from today's rendering. It carries an old-to-new table and one home screenshot comparison. Calibrating the base scales from the design moves to the pipeline phase.
- **Layout check:** the layout check (6-T1) guards against regressions in between.
- **CI:** CI is now in scope for this phase. The 6-T1 decision "local only, revisit before the merge to `main`" is reopened when the CI item is discussed.
- **Open:** whether the second submission waits for the design pipeline, or ships with today's values plus the polish pass.

**Decided: CSS readiness definition** (user, 2026-10-08). The goal: from design to theme in controlled, repeatable batches under the harness. JS already meets it. CSS meets it when all four criteria hold on the pilot page.

1. **Fluid and adaptive.**
    - **Approach:** layout follows content and container, not design pixels: fluid type and spacing (`clamp()`), container queries for components, and layout switches only at the token breakpoints.
    - **Check:** the layout harness sweeps every template from 320 to 2560 in 40px steps for:
        - horizontal page scroll;
        - clipped or overlapping content;
        - content edges off the page margin;
        - tap targets under 24px.
2. **Settings chain, and settings that are visible.**
    - **Chain:** every merchant-facing appearance decision runs `settings_schema` → `css-variables` → token → class. Sections hard-code no colour, font or spacing values; extend the lints to raw values.
    - **Visible:** the needed settings are exposed, and every exposed setting takes effect. A new lint finds dead settings (defined in a schema but unused in its markup or CSS).
3. **Abstraction and management.** Every pattern has one owner, and a pattern with two consumers is extracted (`card-rail`). The ownership and settings-chain lints cover what they can; duplicated patterns go on the verifier checklist.
4. **Outcome.** A design-to-delivery batch needs at most one correction round caused by CSS. The product page is the pilot that tests this.

**Hard requirements vs open choices:**
- **Hard requirements** come only from Shopify's official sources:
    - typography through `font_picker`;
    - colour through schemes and settings;
    - accessibility (contrast, focus, 24px targets);
    - browser support;
    - performance.
- **Open choices:** third-party practice (Utopia, Every Layout, Horizon) is experience to weigh and decide on together.

**Decided: design source** (user, 2026-10-08; replaces the calibration-by-measurement step in "Conclusion: design input"):
- **Designs give intent only:** which elements appear, their order, and their relative weight. They never give values. The current designer's work covers appearance, but not type, spacing or colour control, so it is not a value reference.
- **Values come from our system:** the type and spacing scales, font roles and colour schemes are set once from the user's judgement, and every page uses them. Agents map intent to semantic tokens (main heading → `display`, tight group → `related`).
- **Design production:** a design comes from the user's base design plus a design tool or agent (for example Stitch), constrained by our system through an SOP that we write, or else a design agent using our vocabulary. Whether Stitch can take our tokens as constraints is checked against its documentation when this step starts.
- **Base scales** (user, 2026-10-08): set the same way, from the user's base design through an agent-era design tool such as Stitch, not from hand-picked numbers or measured screenshots. The tool choice and the SOP are settled when the pilot starts. **Deferred** to the design-pipeline phase after the skeleton backport ("Decided: order of work"); until then tokens keep today's rendered values.

**Open: design-tool sites and the Figma value pilot** (discussion with the user, 2026-10-09; nothing decided, the batch order above is unchanged, 6-C5 comes next and needs none of this). **Parked** (user, 2026-10-09): the CSS batches run as planned with today's values; this discussion resumes after they are all done, and the values are adjusted then.
- **Sites reviewed** (the user's bookmarks): Refero (screen library plus Refero Styles, DESIGN.md-style specs of real sites; the official MCP needs a paid Pro, Team or Lifetime plan), Lovart and Stitch (AI design output: images, SVG, PSD), Godly, Dribbble and Pinterest (inspiration), React Bits, Aceternity and MotionSites (React components: motion reference only, the stack rule excludes React), Uiverse (plain CSS snippets). Added by the coordinator: Utopia (`utopia.fyi`, fluid type and space scale calculator, the user is adding it), ecomm.design, Commerce Cream, Baymard, Typewolf, Realtime Colors, and the Theme Store as a distinctiveness check.
- **Leaning (not decided):** this theme keeps the user's Figma design as its only style source; no external style md, design MCP or new skill is brought in, so the result cannot drift from the design the owner judges by appearance. External md files serve at most as a checklist of what a design spec should define. Productization (design tool or external md as the style source, automated runs) is tried later in the skeleton, matching "Decided: order of work".
- **Pilot idea:** read the home design's values from Figma once (REST API with a read-only personal access token, the user runs the call; one call returns the whole file), take the 1440 and, if it exists, the 390 canvas as the two ends of a Utopia `clamp()` scale, snap stray values (58 vs 60px) to the nearest step with named exceptions, apply to one built section and compare by eye at both widths. Exact at the canvas widths, interpolated between; only one canvas means mobile is derived, not matched. Utopia assumes a 16px rem, the theme root is 10px, so its rem output is converted. The pilot would draft both the 6-C7 / 6-C8 scales and the design-to-section SOP.
- **Conflict to settle then:** "Decided: design source" says designs never give values and defers base scales to the design pipeline; the pilot would take scale values from the Figma design now.
- **Open questions:** does the Figma file have a mobile (about 390) canvas; Lighthouse and the technical requirements are still unchecked by Shopify for any version, a second risk beside the design.

**Earlier specification discussion (page frame rules, width and height)** (CSS specification step 1 of 5; user, 2026-10-07). Order: page frame → spacing rhythm → font roles → breakpoints → colour scheme roles. The home polish pass then applies them; the skeleton backport follows once they hold on real sections.

- **Why now.** The design mismatches came mostly from missing rules, not code bugs. The goal is that later sections are built from a design without discussion.
- **Evidence, width.** The mechanism exists: `section-frame` `width: page` (default, `container-page`) or `full`, and the page frame layer in `css-architecture.md`. No rule says when `full` is allowed or what may span it. Eight sections use `full`. Five keep their content in `container-page` (`slides-show`, `routine-showcase`, `article`, `blog`, `main-page-about`) and `ritual-steps` insets its own grid. `promo-bannder` and `google-map` run their media edge to edge. The 6-S12 spec asked for a full-bleed media column and nothing stopped it (corrected in `355851f`).
- **Evidence, height.** Height kinds exist (`content`, `media`, `stage`, `stage-pc`), but four sections declare `content` and set screen heights in their own CSS, each with a different formula:
    - `featured-product`: `min(calc(100svh - 6rem), 96rem)`;
    - `promo-bannder`: `max(40rem, 100svh)`;
    - `ritual-steps`: `100svh` multiples for the scroll stage;
    - `routine-showcase`: `clamp(40rem, 58cqi, calc(100svh - 4rem))`.
- **Decided, width** (user, 2026-10-07): content always sits in the page grid, so the left and right margins match from top to bottom. A section may span the full width only with its background; its content keeps the page margins.
- **Conclusion, step 1** (user, 2026-10-07; discussion closed, sources to be supplemented by another agent before the plan):
    - **Layers, like the JS module graph:** tokens → page frame → section frame → section interior. Inner layers consume, never redefine. Grid or flex inside a section is the section's own choice. References: ITCSS, CUBE CSS composition and exceptions, Every Layout.
    - **Width:** one page grid with named lines (`full` / `content`, the breakout grid of Josh Comeau and Ryan Mulligan; Horizon keeps its page grid in global variables too). This replaces the two definitions on `.shopify-section` and `container-page`. The section root spans `full` and carries the background; content sits in `content`. A real exception (`google-map`) declares `full` on its own element and is named.
    - **Height:** default `content`. A cover kind uses `min-height` from one shared screen-height token, never a fixed `height` (Every Layout Cover). It is for the hero and the scroll stages (`ritual-steps` style A, `promo-bannder` panels). The media-led two-column sections (`featured-product` carousel, `routine-showcase`) use the same token.
    - **Enforcement:**
        - `lint:theme` rejects `--page-width` / `--page-margin` and `vh` / `svh` / `dvh` in section stylesheets outside the frame;
        - the width rule also goes into the verifier checklist.
    - **Follow-up batch, section CSS layering** (superseded 2026-10-09 by "Decided: 6-C6 direction"; kept as history): wrap every `{% stylesheet %}` in a `sections` layer added to the order statement in `tailwind/tailwind.input.css` (`theme, base, components, sections, utilities`; the leftover `snippets` layer name is reused or renamed).
        - Shopify compiles the tags into one `styles.css` linked from `content_for_header`. Layer order follows the first declaration, which `tailwind.output.css` makes above that tag.
        - Before it: audit the 63 blocks for rules that override utility classes (for example `featured-product`'s `padding-inline: 0` against `px-6`), since section CSS loses to utilities once layered.
        - Confirm in the browser that the compiled `styles.css` keeps `@layer`.
        - A lint requires the wrapper.
    - **Planned:** the page frame part is plan 6-F1, recorded and not authorized; its full text is `git show c0e9bcb:docs/agent/context.md`. It left `context.md` for bug fix 6-B3 (2026-10-07). The user asked to slim it (one lint, no grid rewrite); revise it before authorization.
    - **Batches:** the page frame batch first (Ask tier: `base.css`, `container-page`, `section-frame`, the eight `full` sections, the four sections with their own heights), then the layering batch.

- **Conclusion, step 2: spacing** (user, 2026-10-07):
    - **Between sections (frame):**
        - keep the merchant `padding_top` / `padding_bottom` ranges (Shopify norm, no data migration);
        - set their default to one value measured from the design;
        - raise the 100px maximum if the design needs more.
        - Changing the saved values in `templates/*.json` is merchant configuration and needs the user's approval.
    - **Inside sections:**
        - one fluid space scale of about seven steps (Utopia-style `clamp`), with `tight` / `related` / `group` and a new `section-gap` as semantic aliases;
        - agents map a measured design value to the nearest step, so no 2.5px unit arithmetic. Accepted: steps are not pixel-exact; exceptions are rare and named.
    - **Enforcement:**
        - `lint:theme` rejects raw numeric spacing utilities (`gap-N`, `mt-N`, `space-y-N` and similar) in changed sections, with a baseline count of the about 250 existing uses that may only fall;
        - the polish pass migrates them.
    - **Evidence:**
        - home sections default to 32 + 32px between sections (fluid to 0.6× on mobile); a rough reading of the downscaled design preview suggests about 120–140px at 1440, to be measured at full resolution;
        - the gap tokens exist but are used 8 times against about 250 raw `gap-N` and similar.
- **Conclusion: design input** (user, 2026-10-07):
    - **Inputs:** the designs come from Figma.
        - Figma MCP is not adopted (paid seats).
        - The design author works on appearance only, so even 1:1 exports stay screenshots of one width and one state.
        - Design-tool values do not map directly onto a fluid, merchant-configurable theme.
    - **Target workflow:** a controlled agent pipeline from design to delivery inside the harness, the way this collaboration works:
        1. the CSS specification becomes the design system (tokens, the space scale, font and colour roles, frame kinds, the section catalog with its style variants);
        2. the user gives a reference (Figma screenshot, reference site, intent);
        3. a design agent produces a prototype using only the system, at 1440, 768 and 390 with states, and the user judges its look;
        4. the plan maps the prototype onto sections and settings one to one, and anything outside the system is flagged as a named exception;
        5. implementation under lint;
        6. verification by numeric screenshot comparison at the same widths, plus runtime tests;
        7. user acceptance.
    - **Order:**
        - finish the CSS specification (steps 3–5);
        - calibrate the scale from the current home page and its design, with the coordinator measuring and the user confirming;
        - then choose the design-agent tooling.
    - Adding the workflow to the SOP is a rule change for the user to approve.

- **Conclusion, step 3: type** (user, 2026-10-07):
    - **Font roles:** heading, body and accent, each with a `font_picker` on the settings chain. Accent covers badges, eyebrows and prices. The design's serif and monospace families are to be confirmed in Shopify's font library.
    - **Weights:** each role declares regular, one emphasis weight and italic if needed; `font_modify` loads exactly those. Weight settings offer only loaded weights. `lint:theme` rejects weight utilities without a loaded face (today `font-medium` renders at 400).
    - **Scale:**
        - one fluid modular scale of about nine steps (Utopia-style), on the same base as the space scale;
        - semantic aliases: display, heading-l/m/s, body, body-s, label, caption;
        - agents map a measured size to the nearest step.
    - **Migration:**
        - the existing `heading-*` / `body-*` names (about 1,100 uses) become aliases pointing at scale steps;
        - the batch carries an old-tier → step table with pixel values before and after, plus one home screenshot comparison;
        - the polish pass renames per section to semantic names;
        - `lint:theme` baselines the old names, which may only fall; the aliases are deleted at zero.
    - **Merchant control:** the three role fonts, the base size and the scale ratio; no per-level sizes.
    - **Merchant-visible values (coordinator count, 2026-10-08; raised by the user):**
        - about 40 `select` settings in 30+ sections use tier class names as option values (about 500 option values);
        - about 62 saved values in `templates/*.json`, `config/settings_data.json` and the section groups use them.
        - **Constraints:**
            - 6-C8 keeps the option values as stable IDs and maps them to scale steps in Liquid, so saved merchant data needs no migration;
            - renaming option values needs the user's approval and a migration of merchant data. Before choosing it, check in Shopify's documentation what happens to a saved value that is no longer an option;
            - editor labels may move to semantic names through locale keys;
            - lints and baselines count class usage in markup only, never schema option values.
        - **Redesign the merchant size settings with the scale** (user, 2026-10-08). 6-C8 starts with a proposal for the user, before any implementation:
            1. inventory every size setting: the sections that have one, their options, and the values merchants saved;
            2. compare with Dawn and Horizon, checked through Shopify Dev MCP and their source:
                - how many steps they offer;
                - how they name the steps in the editor;
                - which sections expose a size setting at all;
            3. show a table: current option → new option → editor label → pixel value at 390 / 1440.
            The user approves before implementation.
    - **Evidence:**
        - 10 fixed heading tiers in two naming systems (plus `heading-size-custom`) and 7 body tiers;
        - `heading-xl` (45px) is larger than `heading-h1` (40px) on desktop;
        - two-step sizes switching at 768px;
        - the 6-S6 design value of 58px was mapped to `h1` (40px) instead of `2xl` (60px).

- **Conclusion, step 4: breakpoints** (user, 2026-10-07):
    - **Tokens:** three tokenized breakpoints, `tablet` 48rem (768), `desktop` 64rem (1024) and `wide` 80rem (1280). `pc` and `fw` remain as aliases with a `lint:theme` baseline that may only fall.
    - **Layout switches:** column-count and side-by-side changes happen at `desktop` by default. 768–1023 gets the widened mobile layout or an explicit tablet variant.
    - **Container queries:** recommended for components inside a section that appear at different widths. They are MDN Baseline widely available and inside the browserslist matrix (last 2 Safari / iOS).
    - **Hover:** two named variants, `can-hover` (`(hover: hover) and (pointer: fine)`) and `no-hover` (its negation; renamed from `touch` after the source supplement), replace the three current combinations.
    - **Enforcement:** Liquid stylesheets cannot use `theme()` (6-V1) and custom properties do not work in media queries. So `lint:theme` allows only `width >= 48rem / 64rem / 80rem` and their `<` forms there, and rejects px values, `min-width` spellings and other numbers.
    - **Evidence:**
        - 1024 is hand-written in 8+ sections (16 uses, four spellings, no token); 768 has five spellings;
        - `pc:` is used 466 times, so tablets get desktop layouts (iPad pass, 2026-10-05).

- **Conclusion, step 5: colour** (user, 2026-10-07). Order of sources: schemes first, then the derived roles, then standalone colour settings as named exceptions. The derived layer, scrims and enforcement are built (6-C4). **Left for 6-C9** (needs approval for `config/settings_data.json` and schema IDs):
    - five schemes, adding a sage scheme and a page-background scheme, plus a card surface role (the white cards carry `lint-allow raw-colour: owner 6-C9`); scheme-1's default blue badge corrected; values from the calibration;
    - the standalone colour settings: 8 global badge colours, `main-page-contact` form background and text, `product-comparison-table` column background, success and danger, `product` zoom overlay, icon and a block's colours; each becomes a scheme picker, a scheme role, the scrim or a role, or stays as a named global status colour;
    - a lint that rejects new `color` / `color_background` settings outside an allowlist with a reason;
    - `assets/gift-card.css` (own fixed palette, exempt from `raw-colour`).
- **Source supplement** (external read-only agent, 2026-10-07; report outside the repo: `C:/Users/Joey/AppData/Local/Temp/ceylune-css-spec-sources.md`; Horizon `5acd1b6`, Dawn `258f00f`). Corrections that the plans must carry:
    - **Attribution:** the background-only width rule, schemes-first colour and the 1024 desktop switch are project policy, not Horizon or Shopify practice.
        - Horizon's page grid uses numeric columns (no named lines) and lets full-width sections span their content.
        - Horizon's colour model is a `color_palette` of five entries plus local `background_color` on group blocks, not schemes.
        - Shopify's colour guidance now also describes palettes with local overrides.
        - Dawn and Horizon switch at 750 / 990.
        - Named lines come from Ryan Mulligan's breakout grid, and the cover `min-height` from Every Layout.
    - **Layering (follow-up batch):** layered section CSS loses to utilities only for competing normal declarations. `!important`, inline styles and any CSS left unlayered behave differently, so the audit covers them too. There is no official statement that Shopify keeps `@layer` in the compiled `styles.css`; the browser check stays a hard gate.
    - **Fonts:**
        - `font_modify` returns nil for a missing variant, so every role needs a fallback;
        - some serif families have only 400 (DM Serif Display).
        - Available: Cormorant (300–700 with italics); monospace with italics: IBM Plex Mono, Roboto Mono, Space Mono, Source Code Pro, Azeret Mono, Anonymous Pro, Courier New.
        - The code already loads base, bold, italic and bold-italic per role; the gap is the medium weight.
        - The fixed heading tiers are 10 (four display + h1–h6); `heading-size-custom` is the eleventh utility.
    - **Colour features:**
        - derived tokens use `color-mix()` (Baseline widely available);
        - relative colour syntax is only newly available, so it is not used;
        - the contrast script checks the pairs it lists, not opacity, gradient or image contexts.
        - Theme Store requirement 16 asks for at least four colours with foreground pairs; Dawn ships schemes only, so the scheme model stays.
    - **Breakpoints:**
        - `rem` in media queries follows the user's default font size, not the 62.5% root;
        - the second hover variant does not detect touch (hybrid devices). Name it `no-hover`, defined as `not ((hover: hover) and (pointer: fine))`, instead of `touch`.
    - **Root size:** the 62.5% root has no primary-source endorsement with Tailwind, and px-valued body tokens ignore the user's default font size. Not a blocker; revisit with the type token batch.
    - **Design input:** Figma's remote MCP works on every plan, with up to 6 tool calls a month on Starter plans or View/Collab seats (rechecked 2026-10-09; the REST API's file-content tier has the same cap) and 200 a day on paid Dev/Full seats. Only the desktop server needs a paid seat. The decision not to adopt it stands.
- **Specification discussion closed** (2026-10-07). Next:
    1. ~~sources supplemented~~ (done, above);
    2. then the plans, in order: the page frame batch → section CSS layering → tokens (space, type, colour, breakpoints) → calibration → the home polish pass.

**Cleanup survey** (coordinator, 2026-10-06, read-only; for the cleanup batch):

- **Unused, safe to delete:** `assets/icon-eyeglasses.svg` (its only consumer, the old `scroll-categories` caption, was removed in 6-S6).
- **Not placed in any template, but keep:**
    - `custom-liquid`, a merchant utility;
    - `pickup-availability` and `collection-navigation-items`, which are fetched through the Section Rendering API;
    - the social icons, which are named dynamically in `snippets/social-icons.liquid`.
- **User decision:**
    - remove `category-grid` (replaced by `collection-list` in 6-S3, placed nowhere) or keep it as an option;
    - the sections removed from home at the order review (user, 2026-10-07; home now follows the full design): `before-after-comparison`, `promotion-countdown`, `about-stats`, `newsletter-banner`, `video-banner`, `google-map`. Delete with code, or keep as options. `blog-stories` stays on home without a redesign (user, 2026-10-07);
    - ~~one or both `ritual-steps` instances~~: decided (user, 2026-10-07, replacing the 2026-10-06 decision). Home keeps both instances back to back, as the design shows: `ritual_steps_sticky` (style A) and then `ritual_steps_carousel` (style B).

**Motion simplification done** (6-M1, `3652441`; plan and review rounds: `git show 3652441:docs/agent/context.md`): the list and card cascade is the only settings-driven reveal, under `motion_enabled`. Follow-ups: `assets/motion-reveal.js` is still 29.9 KB because the cascade machinery was kept unchanged; rewrite it smaller once the design phase settles the cascade's look. GSAP arrived in 6-S5 (`a2424d4`): `motion-gsap.js` adapter, first consumer `scatter-gallery`. Cascade in carousels (6-S4 R10, 2026-10-05): the entrance `translateY` (64px desktop, 40px mobile) is clipped by the Swiper `overflow: hidden` until the slides settle. The rest state is correct. Settle it with the cascade rewrite (for example no vertical offset inside overflow containers).

Home `slides-show` redesigned (6-S1, `a0a5aa6`, content `99ee7b1`; plan and review rounds: `git show a0a5aa6:docs/agent/context.md`). Browser checks still open for it: a real Theme Editor block select and deselect, native reduced motion.

Design workflow (user, 2026-10-04): one section at a time, one page at a time, starting with the home `slides-show`. The user puts screenshots (desktop about 1440 wide, mobile about 390) and optional notes or reference sites in `docs/design/<page>/<section>/` (excluded from Shopify upload by `docs/**`; images are Git-ignored and stay local since 2026-10-05, each folder keeps a tracked `notes.md`; once a section's batch is reviewed and committed, its images are deleted, user 2026-10-05). Per section: compare with the current implementation and plan (schema changes, GSAP need), implement, compare dev screenshots at the same widths, user acceptance. Decisions that set the tone for later sections (type, scale, spacing, colour roles, motion timing) are collected as a growing design specification. Figma values are not used directly; reference sites are inspected with Chrome DevTools MCP for motion.

Design specification (grows section by section; first entries from the home `slides-show`, user 2026-10-04):

- Hero headline: uppercase, very large, tight leading; links in the hero: underlined, uppercase, trailing arrow icon. Open (6-S4 review, 2026-10-05): the `slides-show` CTA uses `link` `variant: 'underline'`, which shows the line only on hover or focus. 6-S4 Shop all uses `default` (resting line) per its design; decide whether the hero CTA should rest underlined too.
- Slide transition text motion: CSS only (headline group, then body, small stagger), never on the first slide at page load, gated by `motion_enabled` and `prefers-reduced-motion`. No GSAP or SplitText for it; GSAP stays reserved for the home scroll narrative.
- Accent colour (user, 2026-10-04; 6-A1, `9f458cf`): the scheme's `accent` colour (`--color-accent` triplet, `--color-accent-ui` token; default the design lime `#D5FF83`) is for pagination and highlights; first consumer the slideshow's active pill. Open check: Theme Editor live preview of the colour.
- Promo bar / marquee (6-S2, `8cc18be`; plan and review rounds: `git show 8cc18be:docs/agent/context.md`): colour `scheme-3` (lime `#d5ff83` background, dark green `#263d29` text) for accent bars; separator spacing in `em` (0.5em before, the gap setting after); text sizes by responsive tier pairs (`pc:` / `max-pc:` literal classes, as in `slides-show`). Scroll-linked motion uses `subscribeScrollVelocity` in `assets/utils.js` (one shared passive listener) and modulates CSS animations with `updatePlaybackRate`; no GSAP. Open browser checks: hover pause (forced `:hover`), touch tap does not pause, native reduced motion.
- Collection cards (6-S3, `75d077b`; plan and review rounds: `git show 75d077b:docs/agent/context.md`): new `collection-list` section (carousel only, `collection_list` source). Card hover: clockwise `rotate(2deg)`, lift 6px, soft shadow `rgba(var(--color-foreground), 0.18)`; image swap, neutral scrim (0.58 over the title box) and white title only when a second image exists; `:hover` fine-pointer only, `:focus-visible` on every device; reduced motion removes the motion. Pending: a card surface colour role (cards use `bg-white`), and the section background (design sage against `scheme-2` grey). Open browser checks: real touch tap, real `:hover`.
- Product badges and featured products (6-S4; plan and review rounds: `git show 1aa88ed:docs/agent/context.md`):
    - **Badges** live in the shared `product-card` (`snippets/product-card-badge.liquid`): one badge at most, in the order sold out, sale (`-N%`, or "Sale" when prices vary), custom tag 1, custom tag 2.
    - **Badge colours** are theme settings (background and text per badge). Defaults are darkened from the mockup to reach 4.5:1.
    - **Badge size:** `body-xs`, uppercase, padding `0.45em 0.8em`, radius `0.25em`. The badge sits at the top right of the media, or the top left on coarse pointers.
    - **Section links** below a carousel use `link` `variant: 'default'` (resting underline) with a trailing arrow, centred.
    - **Open:** custom badges in the browser, badges in recommendations, and lite cards in the header super menu are Blocked for data.
    - **Open:** the per-scheme `badge_*` colours (`snippets/css-variables.liquid`) have no consumer of their own since 6-S4. Decide whether to retire them (a schema removal, Ask tier).
- Scatter gallery (6-S5, `a2424d4`; plan and review rounds: `git show a2424d4:docs/agent/context.md`):
    - **Section:** new `scatter-gallery`, with fixed slots (8 on desktop, 6 on mobile) around a three-line uppercase statement that sits above the images.
    - **Motion:** one scrubbed, unpinned ScrollTrigger over the whole pass (`top bottom` → `bottom top`). The cards start gathered with overlap, hold the design layout from 0.36 to 0.68, then spread outward by 0.24 on desktop and 0.16 on mobile.
    - **Exit spread:** the user's decision. The alethia.earth reference block shows no exit spread.
    - **Gates:** `motion_enabled` off, reduced motion and no JavaScript all show the layout.
    - **Pattern for later GSAP sections:** load GSAP one viewport ahead through the section module's own observer; the core's 200px `data-module-lazy` margin is too late for a first-frame state.
    - **Open:** the section background (design sage against `scheme-2` grey), the same item as in 6-S3.
- Indexed hover list (6-S6, `ae9e9da`; plan and review rounds: `git show ae9e9da:docs/agent/context.md`):
    - **Section:** `scroll-categories`, rewritten on the product model: a heading with a "(NN)" count, a divider, and rows of index plus title.
    - **Desktop (from 1024px):** a right panel shows the active row's image, a description excerpt and a link. Hover or focus activates a row, and the panel holds the last active row.
    - **Keyboard:** the inactive panels use `visibility: hidden` (no JavaScript `inert`), so keyboard order and resizing stay correct without a script.
    - **Below 1024px:** every item is expanded.
    - **Pattern for later sections:** hide inactive content with CSS visibility under the layout media query instead of a JavaScript-computed `inert`, which does not refresh on resize.
    - **Polish items:** in the Home polish pass list.
- Testimonial marquee (6-S7, `0f33e1c`; plan and review rounds: `git show 0f33e1c:docs/agent/context.md`):
    - **Section:** `testimonial-featured`, rewritten as a marquee of two-card columns with alternating offsets; the columns bob on `watermark-marquee-bounce`.
    - **Cards:** row-alternating card schemes, light cards on `#fff`, and a `show_image` block toggle.
    - **Marquee module:** `scrolling-marquee.js` is the shared marquee module, through data hooks with optional `data-scrolling-velocity-k` and `data-scrolling-max-rate` (defaults 0.12 and 4). Tuned values: testimonials 1.2/8, icon strip 1/6.
    - **Lesson:** `inline_richtext` rejects `<br>`, and a rejected template blocks the whole `shopify theme dev` upload. If the dev store shows stale settings, restart `shopify theme dev`.
- Step showcase (6-S8, `4d5ff30`; plan and review rounds: `git show 4d5ff30:docs/agent/context.md`):
    - **Section:** `routine-showcase`, rewritten in place. One `step` block per product, with a step label, an optional arch scene (fallback: the product's second image, then a placeholder) and an optional floating packshot (fallback: the featured image).
    - **Desktop (from 1024px):** the stage height comes from the content width (`58cqi`, capped at the screen height). The arch is a bordered pill at 90% of the stage, ratio `--routine-arch-ratio` 0.5. The packshot box overlaps the arch's bottom edge and is anchored with the `image` snippet's `position: 'bottom'`.
    - **Steps:** WAI-ARIA tabs with roving tabindex. Inactive panels use CSS `visibility: hidden`.
    - **Autoplay** (user decision):
        - it always runs; a selection restarts the fill on the new step;
        - it pauses only while the pointer is over the active thumbnail, while keyboard focus (`:focus-visible`) is on the active tab, off-screen, or in a hidden document;
        - there is no pause button.
    - **Mobile:** a native scroll-snap card rail, with no autoplay.
    - **Pattern for later sections:** the `image` snippet applies Shopify's focal-point `object-position` unless `position` is passed. Pass it whenever the layout needs an anchor.
    - **Lesson:** plan numeric targets against the container the section actually sits in. R2 tied the height to the viewport width while the content was capped, and R3 removed the page width. Both were coordinator errors, and each cost a round.
- Stacked image panels (6-S9, `b94d212`; plan and review rounds: `git show b94d212:docs/agent/context.md`):
    - **Section:** `promo-bannder`, rewritten in place; the type ID keeps its spelling. Each `card` block is a panel: a main image, a heading, a description, a small image, an optional link and its own colour scheme.
    - **Desktop (from 1024px):** each panel is one screen tall (`--promo-bannder-panel-height`), `position: sticky; top: 0`, with a rising `z-index`, so the next panel slides up over the previous one. This is pure CSS and works without JavaScript. The image side alternates (odd left, even right) through CSS `order` under the desktop query only.
    - **Image motion:** as on loiseau.framer.website, an IntersectionObserver at 0.5 toggles `is-in-view`, and the main image eases from scale 1.2 to 1 over 600ms on entry and back on exit. It is time-based, not a scrub, and needs no GSAP. Motion off, reduced motion and no JavaScript keep it at 1.
    - **Mobile:** image (4:5) above text in normal flow, with no sticky.
    - **Pattern for later sections:** percentage margins resolve against width, so vertical placement inside a fixed-height panel uses a height variable. Placeholder wrappers are `aria-hidden` (see the snippet item in the polish list).
- Trust strip (6-S10, `8fbe2c8`; plan and review: `git show 8fbe2c8:docs/agent/context.md`):
    - **Section:** the existing `icon-with-text`, extended: an optional item description, `alignment` (default center), and an optional bottom wave (`show_wave`, `wave_color_scheme`). It is the last section on home.
    - **Wave:** the asset `icon-divider-wave.svg` (`preserveAspectRatio="none"`) rendered through the `icons` snippet inside the `section-frame` `background` slot. `lint:theme` forbids inline SVG in Liquid. Its fill is the wave scheme's background on a transparent wrapper.
    - **New icons:** Phosphor regular `shield-check` and `hand-heart` through `build:svg`.
    - **Pattern for later sections:** decorative full-bleed shapes go in the frame's `background` slot as icon assets.
- Ritual steps (6-S11, `15d5c6b`; plan and rounds: `git show 15d5c6b:docs/agent/context.md`):
    - **Section:** new `ritual-steps`. One `step` block per step, with a `layout` setting.
    - **Style A, `sticky_media`:** screen-tall text slots, each repeating the section title (the copies are `aria-hidden`). A sticky, tilted oval scene cross-fades at the centre line.
    - **Style B, `scroll_carousel`:**
        - the stage pins for `steps × 100svh`;
        - centre-line sentinels sit in a track starting at `50svh`, each `(n − 1) / n × 100svh`, so the switches are evenly spaced;
        - the text fades, the packshot rocks from its base, and an outline numeral sits behind it;
        - number buttons jump to a step.
    - **Mobile:** a scroll-snap rail with dots.
    - **No GSAP:** sticky positioning, IntersectionObserver and CSS only.
    - **Patterns for later sections:**
        - **Grids:** never put `container-page` on a custom grid, because its `& > * { grid-column: 2 }` collapses the columns. Use `padding-inline: max(var(--page-margin), calc((100% - var(--page-width)) / 2))`.
        - **Sticky:** a sticky child needs a parent that spans the scroll range (`align-items: stretch`).
        - **Headings:** heading tiers set `text-transform` from a theme variable, so uppercase must come from a section rule. Heading tiers go on `h*` elements only; decorative copies use the `heading` snippet with `attrs: 'aria-hidden="true"'`.
- Featured product and shared purchase controls (6-S12, `9a56b9e`; plan and rounds: `git show 9a56b9e:docs/agent/context.md`):
    - **Section:** `featured-product` `gallery_layout: carousel`: both columns inside the page grid (user, 2026-10-07: only backgrounds may go full width, content keeps the page margin on both sides), vertical dots in the scheme foreground, `contain` fit, and the info column stretched with `space-between`.
    - **Two columns:** `productLayout` makes the shorter column sticky. The fixed media height sits on `.featured-product__media-sticky`, never on the column itself, so the sticky child has room.
    - **Shared on every product surface:**
        - option buttons with a colour dot and a visible label;
        - uppercase option names;
        - full-width uppercase buy buttons;
        - a `heading-h1` price, with an optional rating (`show_rating`, `reviews.rating` metafields);
        - benefit texts (`item_N_text`).
    - **Quantity box:** restyled for `data-qty-surface='product'` only; the cart is unchanged.
    - **Patterns for later sections:**
        - **rem:** the theme's root font size is 10px (`2rem` is 20px in property values), while media queries resolve `rem` at 16px (`64rem` = 1024px).
        - **Motion gate:** `layout/theme.liquid` emits `data-motion-enabled="false"` only, so motion CSS gates on `body:not([data-motion-enabled='false'])`.
- Card surface and depth (user, 2026-10-05; recorded, not yet planned):
    - **Surface colour.** The design's product cards (6-S4) and collection cards (6-S3) are white panels on the sage section background. Product cards have no surface of their own today, and collection cards hard-code `bg-white`.
    - **Coordinator proposal, layer 1:** a card background role in the colour schemes, default white, shared by product and collection cards.
    - **Coordinator proposal, layer 2 (optional, later):** a product or collection metafield that overrides the colour per card. This is how the Partake reference matches each card to its art-directed packshot. Liquid cannot read an image's dominant colour, so there is no automatic match.
    - **Uniform colour and product images:** transparent or white packshots blend with the card; images with their own background show as a framed block.
    - **Hover depth.** The design reads as a flat 2D card at rest turning into a raised 3D card on hover, done with the shadow. Reference: `docs/design/home/category-grid/hover-depth.png` (local, Git-ignored). Left: the rest card, white and flat. Right: the hovered card, tilted, with a deep soft shadow along its lower and right edges.
    - **Gap:** today's single `0 16px 32px` shadow is flatter. Measure and design a layered shadow (a tight contact shadow plus a wide diffuse one, possibly tinted) when the card surface batch runs, and decide then whether product cards get the same depth on hover.
- Shared carousel controls component, from the 6-S1 pagination (user, 2026-10-04). A snippet for the dot buttons and optional pause button plus a JS helper for `aria-current`, progress, pause/play, hover and focus pause; variants by parameter (`progress` pill or plain `dots`, pause on or off) and colour by CSS custom properties defaulting to scheme roles. Candidate consumers: `testimonial-featured` (autoplay with no pause control today, a WCAG 2.2.2 gap), `icon-with-text` and the product gallery (Swiper bullets), `featured-products` and `routine-showcase` (arrows only). Decided (user, 2026-10-04): extract it with the second real consumer, `testimonial-featured`, when the section-by-section design reaches it. **Update (6-S7, 2026-10-05):** `testimonial-featured` became a marquee with no pagination, so it is no longer the second consumer. Extraction waits for the next real consumer.
    - **Decided (user, 2026-10-08): split the indicator from the controller.**
        - **Shared indicator:** only the presentation and accessibility of dots, the progress pill and bars, plus the optional pause button: `aria-current`, 24px targets, scheme colours. Its small API is set active index, set progress, and report a selection.
        - **Controller, per section:** whatever drives the index stays in the section. That is Swiper autoplay (hero), scroll position (`card-rail`), scroll linkage (ritual style A) and the bar-and-text linkage (routine).
        - **Consumers:** `slides-show` (pill plus the mobile pause button above) and `card-rail` dots (6-S13) give two real consumers. Plan it together with the mobile pause button.

Home polish pass (user, 2026-10-05). Per-section batches now settle structure, data, interaction logic and accessibility only, and close once they are roughly right. After the remaining home sections are done, one batch tunes the following across the whole home page against the designs:

- **Colours:** the section backgrounds (design sage against `scheme-2` grey: 6-S3, 6-S5, 6-S6); the card surface role and the hover depth (card surface item below); the badge colours that were darkened for contrast (6-S4).
- **Breakpoints:** tablet widths of 768–1024 on every section (the theme's `pc` breakpoint is 768). The 6-S6 1024px layout breakpoint is kept or revised there.
- **Hover and touch:** hover-only behaviour on touch devices (6-S3 cards, 6-S6 rows) and the hero CTA underline (resting or on hover, under the hero item above).
- **Typography:**
    - weights: only the 400 and 700 faces are loaded, so decide on the medium weight;
    - the tier choices that missed the design: 6-S6 row titles at 40px against about 58, plus its mobile index and spacing; 6-S3 heading and title sizes;
    - the copied `heading-h1` PC formula in `scroll-categories`, which goes back to plain tier pairs once sizes are settled.
- **Testimonial marquee:** the native reduced-motion check on a real device (MCP emulation does not take effect), and `templates/page.about.json`, which still holds the old testimonial keys (cleanup sweep).
- **Testimonial marquee seam:** with exactly 2 testimonials, half the track holds 3 columns (odd), so the column-offset alternation breaks at the loop seam (6-S7 R4).
- **Tier pairs and layout breakpoint:** in `scroll-categories`, the `pc:` / `max-pc:` tier and flex classes still switch at 768px, while the two-column layout now starts at 1024px. At 768–1023 the index sits beside the title in the stacked layout, and the image `sizes` still switch at `48rem` (6-S6 R12).
- **Step showcase (6-S8):**
    - the heading face (one design export shows a serif);
    - the vertical label shows the step label, while the design repeats the heading;
    - the badge sage is a scheme mix;
    - Treat and Protect have no second image in the dev store;
    - the arch ratio and the packshot box need checking against a real transparent packshot.
- **Autoplay and WCAG 2.2.2 (6-S8):** the only user pauses are hover on the active thumbnail and keyboard focus on it. Touch devices at 1024px and wider have no pause, and there is no pause button by user decision. Decide before any Theme Store submission. **`slides-show` now matches** (user, 2026-10-07): its pause button was removed and it uses the same pause model (pointer on the active dot, keyboard focus, out of view); a manual dot click keeps autoplay running. The same WCAG 2.2.2 question applies to the hero.
    - **Decided (user, 2026-10-08):**
        - **Below 1024px:** `slides-show` gets a small pause/play button beside the dots, styled like the dots with a 24px target, because touch has no hover. Shopify's accessibility best practices say slideshow autoplay "can be paused or stopped" and themes must not rely on hover.
        - **Desktop:** no button (user preference over the design-free extra control). The pause mechanisms are the pointer on the active dot and keyboard focus.
        - `routine-showcase` autoplays on desktop only, so it gets no button.
        - **Closed (user, 2026-10-08):**
            - no desktop button: the mobile button exists only because touch has no other way to pause;
            - previous and next arrows are not a decision item; add them where a design has them.
- **Stacked panels (6-S9):**
    - the design's pale sage (panel 1) against bright lime (panel 3) needs a fourth colour scheme (merchant configuration);
    - the serif heading face;
    - the sticky header overlaps the top of a stuck panel;
    - the small image position (now ending at about 72% of the panel; the design is at 85%);
    - the optional link's Tab reach was not tested with a configured link.
- **Placeholder accessibility (6-S9 review):** the shared `snippets/image.liquid` placeholder branch ignores `alt`, so placeholder SVGs render as unnamed images in other sections too. Decide whether the snippet marks placeholders decorative (a shared-snippet change for the cleanup sweep). **Decided (user, 2026-10-08):** placeholders are decorative (`aria-hidden="true"` on the SVG, `alt=""` on an `img`). They show only when no image is set and carry no content; Shopify's best practices use empty `alt` for decorative images, and the placeholder names (`product-1`) would only be noise.
- **Sage colour scheme (6-S9, 6-S10):** the design's sage backgrounds have no scheme. The trust strip uses scheme-3 with a scheme-2 wave for now. A fourth (sage) scheme would serve 6-S3, 6-S5, 6-S6, 6-S9 panel 1 and 6-S10. The design's icons also use a lighter stroke than Phosphor regular.
- **Third-party notices (6-S10 review):** `THIRD_PARTY_NOTICES.md` has no entry for the Phosphor icon set (MIT) used by every `icon-content-*` asset. Add one in the cleanup sweep.
- **Ritual steps (6-S11):**
    - fonts: the design's serif titles and monospace italic badges, eyebrow and price (`lint:theme` forbids `font-mono`; decide a font role);
    - colours: the sage section background and the badge fill;
    - proportions and spacing against the design, including the oval angle and size, ring offset, star size, numeral size and packshot scale;
    - the header overlap with the sticky frame and stage;
    - **Featured product (6-S12):**
        - the quantity sits beside add-to-cart on mobile (the product page design), while the home mobile design stacks them;
        - cap the `space-between` gaps in the info column on very tall screens;
        - optional sticky add-to-cart bar when the info column is taller than the screen;
        - the price and title sizes against the design;
        - the design's lighter icon stroke (`flask` was not added).

Design phase inputs:

- Component CSS: the shared rules in `tailwind/tailwind.components.css` (product info blocks, quick view, marquee) are reworked in the design phase (user, 2026-10-03).
- Design phase: font faces. The theme loads the base weight and bold only, so `font-medium` renders with the 400 face and `font-semibold` with the 700 face. Load more weights if the design needs them.
- Design phase: article's `padding_top` setting has had no effect since before the frame (the hero carries no section padding and the body block was `layout-no-pt`); 5-C3d3 kept that. Decide with the design rework whether it should apply. **Decided (user, 2026-10-08):** fix it; top and bottom padding are a standard section setting. The article top moves by the stored template value (32), which the user checks. It is also the first known case for the dead-setting lint in the readiness definition.
- Design phase (user, 2026-10-03): only hero-type sections such as the home slideshow are expected to fill the screen; whether other sections keep a set distance from a full screen is decided with the home page redesign. 5-C3c keeps today's heights, identical or close.

## Evidence

- Browser pass status (2026-10-04). Three agent sessions (reports outside the repo: `C:\Users\Joey\AppData\Local\Temp\ceylune-phase5-cutoff-report.md`, `-report-part2.md`, `-report-part3.md`) found two regressions, both fixed: the home slideshow stage size (5-B1, `9c4dd05`) and, pre-existing on the live theme, the dialog close labels and the initial variant selection (5-B2, `6bfdc7c`). No open regression on dev. A suspected cart drawer Escape failure was a misread of the always-present `.cart-overlay-section` shell. The dev-only GraphQL 400 and `shop.app` 403 come from the `127.0.0.1` origin (absent through `?preview_theme_id=`). 6-M1 checks (M8): the cascade on collection, featured-products tabs, blog cards and recommendations; `motion_enabled` off; reduced motion; Theme Editor section reload; headings, text and images without motion; decorative loops unchanged. Still open: live side by side (the agent sessions stayed on the password form), no-JavaScript at 1440, most of G3 and G5, the 5-C3f keyboard focus sweep, the width matrix, product media Escape, reduced motion (the MCP cannot emulate it), facet history, stylesheet subsetting on a pushed theme (5-C1), and the rows Blocked for data, Theme Editor, Safari or configuration variants. Per-batch check lists from the closed batches: `git show fe4b986:docs/agent/board.md` (Evidence, "Consolidated browser pass"). Remaining rows: `docs/migration/phase0/browser-checklist.md`, deleted after the pass.
- Final browser pass, scroll-linked sections (user question, 2026-10-05): GSAP ScrollTrigger behaves the same across desktop engines. iOS Safari can differ through address-bar viewport resizing (ScrollTrigger refresh) and momentum scrolling. In the consolidated pass, scroll `scatter-gallery` and any later narrative section on a real iPhone through an unpublished pushed theme's preview link, because `127.0.0.1` is not reachable from the phone. Per-batch checks stay the user's own Chrome screenshots at 1440 and 390, plus a scroll in device mode.
- Final browser pass, tablet widths (user, iPad, 2026-10-05): the theme's `pc` breakpoint is 768px, so every section switches to its desktop layout on an iPad in portrait. 6-S6 moved `scroll-categories` to a 1024px layout breakpoint after it crowded there. In the consolidated pass, check each home section at 768–1024 (iPad portrait and landscape) for crowding and for hover-only behaviour on touch.
- Browser sweep environment: through the `shopify theme dev` proxy with an isolated MCP profile, `/cdn/shop/files/*` images, `/variants/<id>/?section_id=pickup-availability`, and `/search` return 401 until the storefront password is entered, which hides real image and section failures. Before a sweep, restart `shopify theme dev` if needed and have the user enter the store password in the MCP browser window; the agent never handles the password.
- First submission, clarified (user, 2026-09-29): the ZIP upload passed the automatic syntax check, then the manual review rejected the design as not distinct before any code review. So neither the Lighthouse bar (average ≥ 60 performance, ≥ 90 accessibility on home, product, collection, desktop and mobile) nor the technical requirements have been verified by Shopify for any version of this theme.
- Skeleton backport candidates, **on hold** (user, 2026-10-03; policy in `docs/project.md`; checked against `skeleton/main` `5191a50` on 2026-10-04):
    - the merchant JSON `.prettierignore` exclusion;
    - 5-S (entry scripts snippet, `2e0cddd`): the snippet, the layout render, and the lint that reads the import map from it;
    - H (5-H, `2683402`): `holdUntilReady` in the adapter, `holdForModule` and download-ahead `scanModules` in `base.js`, no mount after a failed import, the moved-lazy-root observer fix, and the matching `javascript-runtime.md` contract. H also closes two skeleton gaps found here: `scanModules` activating an already-loaded container root before deferring its descendants, and module roots in `<template>` content never being scanned;
    - the validator additions that guard the items above (in `theme-contracts.js`, `theme-architecture.test.js`, `doctor-agent.mjs`); the style ownership and settings-chain additions stay here;
    - the Chrome DevTools MCP adapter entries (5-T1) and the `frontend-design` skill.
    - Not a candidate (user, 2026-10-04): the CSS step 3 rules and primitive snippets (5-C3a–5-C3g, 5-B1). They serve this theme's section-block model; the skeleton composes with Theme Blocks as components (as Horizon does) and keeps snippets as code fragments. A GSAP adapter is judged after the home page narrative is built.
    - Timing (coordinator proposal): after the second submission, unless a new theme starts from the skeleton earlier.
    - Already covered by the skeleton reference, not applied here: `javascript-runtime.md` recommends `modulepreload` for a first-viewport module chain that the page truly needs before interaction.
- Process calibration: write acceptance counts from commands, not by hand; execution prompts must state that open board decisions may be cited but not decided. Proposed home: `.agents/roles/implementer.md` and `verifier.md` (a rule change, needs the user's approval).
- Layout harness candidate (cross review 2 of 6-T1, 2026-10-08): a scroller item fully inside the viewport but inside the page margin, cut by its own scroller, is still reported under the viewport-based peek rule (2 `collection-all` nav-link entries in the baseline). A scrollport-visibility exclusion would change the plan's page-margin rule; decide it in a later harness plan. Second case (6-C2, 2026-10-08): `ritual_steps_carousel` mobile rail card 2, product title link at 768. The full sweep never tests 768, and the user chose not to add it to the baseline for now.

## Deferred ideas

- Section cleanup sweep (user, 2026-10-05): sections the redesign takes off the home page (first: `category-grid`, replaced by `collection-list` in 6-S3) stay in the theme for now. After the design phase, review which sections no template uses or no design needs and decide removals in one batch.

- Looping media video (user, 2026-10-05): `snippets/media-video.liquid` already covers autoplay, loop, muted, no controls and optional play/mute buttons. Add a "play when in viewport" parameter (a small module) when a section design first needs a GIF-like video. WCAG 2.2.2 still needs a pause mechanism (at least a focus-revealed pause button, as in the marquee); with reduced motion show the poster.

- Design phase, home page scroll narrative (user, 2026-09-30; the GSAP foundation landed in 6-S5, `a2424d4`, so later narrative sections reuse `motion-gsap.js`; **Three.js closed** (user, 2026-10-08): no requirement uses it, and a library is vendored only when an accepted consumer exists): the user expects GSAP (ScrollTrigger) to be required and possibly Three.js. Compatible with H: a section module (`data-module-id`, typically `data-module-lazy`) loads the library inside its component through an adapter, as `carousel-swiper.js` does for Swiper; H only guarantees the component definition. Constraints from existing rules: the motion reference must classify the work as complex choreography before GSAP; first frame rendered in Liquid and visible without JS; `prefers-reduced-motion` and `motion_enabled` honoured; a Three.js canvas must not be the LCP element (poster image first) and should initialize when visible and idle; vendoring follows `THIRD_PARTY_NOTICES.md`. Full-page loading of these libraries would weigh on every page and on the Lighthouse bar, so on-demand loading is required for them. Loader choice (user question, coordinator answer 2026-09-30): own implementation (H) over Async Alpine, which would change every module; revisit if loading strategies grow beyond eager, visible, idle, or if `interceptInit` changes in an Alpine upgrade. **Vendored library upgrades** (user, 2026-10-07): none by default. Alpine, Swiper and GSAP are upgraded only to fix a bug in the library itself, since the theme needs only what Shopify storefronts use. Runtime tests are the open JS gap, to be decided after the CSS specification.

- CSS craft (user, 2026-09-29): architecture is considered sound, but CSS implementation lacks detail. Coordinator view: the gap is a missing design specification (direction, type scale, spacing rhythm, state rules). `frontend-design` is vendored as a design reference below the project rules (`AGENTS.md`, Agent Skills); the Vercel Web Interface Guidelines were not evaluated. The design phase writes that specification.

- Design phase: the DesignSync tool (user-started `/design-sync`) syncs a local component library with a claude.ai/design design-system project (token and component preview cards). It does not build CSS; it could host the token and key-component previews while iterating on the visual direction the Theme Store review asked for.
