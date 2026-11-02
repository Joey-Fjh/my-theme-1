# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-11-02.

## Plan CB1: collection banner image blur

**Status:** blur setting PASS (correction review); A1 review (coordinator session, 2026-11-02): **PASS**. Check 7 / A1 check 6: the user accepted both settings in the browser (2026-11-02). Batch complete; waiting for the user's commit request.

### Amendment A1 (user, 2026-11-02)

**Decided.** Under "Image blur", add a scrim opacity setting for the hero image: `range` 0–100, step 5, unit `%`, default 50 (today's look). The blur default changes from 0 to 10 ("the middle value").

**Evidence.** The hero scrim is `<div class="absolute inset-0 bg-scrim">`, and `--color-scrim` is `rgba(0, 0, 0, var(--alpha-50))` with `--alpha-50: 0.5` (`snippets/css-variables.liquid`), shared by every `bg-scrim` consumer. `--color-scrim-solid` is the fixed black role. Shopify requires text contrast of 4.5:1 (3:1 for large text), not a scrim (Theme Store requirements, section 12); the scrim rule is the project's (`docs/design/design.md`). `templates/collection.json` and `templates/index.json` save no `image_blur`, so the new default 10 applies to every hero that has an image.

**Surface.** `sections/collection.liquid` (the hero scrim element, the Liquid head that builds the hero values, the schema after `image_blur`, its `{% stylesheet %}` if used); `locales/en.default.schema.json` (`sections.collection.settings.image_scrim_opacity`, `sections.collection.info.image_scrim_opacity`); record files. Not `bg-scrim` or `tailwind/` (other consumers keep 50%).

**Method.**
1. Schema: `image_blur` `default` 0 → 10. New `range` `image_scrim_opacity`, `min` 0, `max` 100, `step` 5, `unit` `%`, `default` 50, label and info locale keys; the info says it darkens the image so the text stays readable, and that low values can make text hard to read on bright images.
2. Markup: the hero scrim uses the scrim role at the chosen opacity: `bg-scrim-solid` with its opacity from the setting (value / 100), through a CSS custom property on the element and a section stylesheet rule, or an inline `opacity`; implementer's choice, recorded. At 0, omit the scrim element. Only when the hero has media, as today. No raw colour literal.
3. Blur markup unchanged; it already reads the setting.

**Review tier:** Ask (schema and markup).

**Estimate:** about 30 minutes, plus the A1 review.

**Checkpoint:** one stop after the validators pass; report the diff, validator output and the opacity mechanism.

**Bar:** must-fix: at scrim 50 the hero scrim computes to the same black at 0.5 as `bg-scrim`; at 0 no scrim element; a hero without media renders as before (no scrim, no blur style); `bg-scrim` and its other consumers unchanged; no new lint, `test:layout` or contrast failure at default settings. Accepted residue: a merchant who lowers the scrim on a bright image can fall below 4.5:1 (the info text warns).

**Acceptance checks.**
1. `npm.cmd run lint:theme`, `lint:i18n`, `lint:liquid-syntax`, `scan:compat`, `test:theme-check` (the pre-existing `listing-page-hero-copy` warning only), `npx prettier --check` on changed files.
2. `git diff` touches only the A1 surface plus the earlier CB1 files.
3. Rendered `/collections/all` (no image): hero layer has no `style`, no scrim element, as before.
4. Reviewer, injected hero markup in the browser: scrim at 50 computes to `rgb(0, 0, 0)` at opacity 0.5; at 0 it is absent from the Liquid output (read from the code).
5. `npm.cmd run test:layout -- --widths 390,768,1024,1440`: only the RR1-E 1024 `collection-all` residue.
6. User: browser look with an image at the defaults (blur 10, scrim 50), and with the scrim moved.

**Outcome.** The `sections/collection.liquid` hero gets one merchant setting, an image blur strength. At 0 (default) the hero renders exactly as today. Above 0 the whole hero image (the collection image, or `fallback_image`) is blurred as frosted glass, so the height-capped `cover` crop no longer reads as a defect; title and description sit on it as before.

**Decided (user, 2026-11-02).** Topic CB1: frosted glass over the whole image, not a panel behind the copy; one `range` setting where 0 means off; not the six `newsletter-banner` blur settings.

**Evidence** (coordinator, 2026-11-02):

- Theme Store requirements (Shopify Dev MCP, "Collection page requirements"): the collection page must output `collection.title`, `collection.description` and `collection.image`. A blurred image still outputs `collection.image`; `fallback_image` is a theme addition.
- The hero renders the image through `snippets/image.liquid` (`mode: 'frame'`, `fit: 'cover'`, `loading: 'eager'`, `fetchpriority: 'high'`, `img_class`) inside an `aria-hidden` layer, under `bg-scrim`, in a frame with `overflow-hidden`. Without an image the layer is `bg-theme-bg`.
- `templates/collection.json` uses the section; adding a setting needs no template change. Locales: only `locales/en.default.schema.json` holds schema copy.
- `filter: blur()` on the `<img>` paints the same as a full-cover `backdrop-filter` layer at lower cost, and needs no `-webkit-` prefix. A blurred image fades at its edges, so it is scaled slightly; the frame's `overflow-hidden` clips the overflow.

**Implementation surface.**

- `sections/collection.liquid`: the hero media layer (the `{%- if collection_hero_has_media -%}` branch) and the schema (one setting after `fallback_image`); its `{% stylesheet %}` if the implementer puts the rule there.
- `locales/en.default.schema.json`: `sections.collection.settings` and `sections.collection.info` (one label, one info).
- `assets/tailwind.output.css`, regenerated, only if Tailwind utilities are used.

**Method.**

1. Schema: `range`, id `image_blur`, `min` 0, `max` 20, `step` 1, `unit` `px`, `default` 0, label `t:sections.collection.settings.image_blur`, info `t:sections.collection.info.image_blur` (says it applies to the collection image or fallback image, and 0 turns it off).
2. Markup: when the value is above 0 and the hero has media, pass the value as a CSS custom property through a `style` attribute on the hero media layer, and apply `filter: blur(var(...))` plus a scale on the hero `<img>` (via `img_class`, or a section `{% stylesheet %}` rule keyed on a class; implementer's choice, recorded). At 0 nothing is emitted: no `style`, no class.
3. Keep the image attributes unchanged (`loading`, `fetchpriority`, `sizes`, `widths`, empty `alt`), and the scrim.
4. No transition or animation is added, so `review-animations` is not triggered; record "no motion change".

**Review tier:** Ask (Liquid markup and schema).

**Estimate:** about 1 hour, plus one Ask review and the user's browser look.

**Checkpoint:** one stop, after the validators pass. Report the diff, the validator output, and the chosen mechanism (utility or stylesheet rule). No screenshots (user, 2026-11-02).

**Bar:** must-fix:
- At `image_blur` 0 the hero HTML has no added `style` or class, and the page looks unchanged.
- Above 0 the image is blurred to all four edges, with no faded or transparent edge visible at 390 or 1440.
- The image is still the eager, high-priority hero image; no new console error.
- No new `test:layout` issue; no new contrast failure on the hero copy.

Accepted residue: the existing hero height and crop at blur 0. Judged on the default settings in `config/settings_data.json` and `templates/collection.json`, plus a collection with an image.

**Acceptance checks.**

1. `npm.cmd run lint:theme`, `npm.cmd run lint:i18n`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run scan:compat` and `npm.cmd run test:theme-check` pass.
2. `git diff --stat` touches only files in the implementation surface (plus record files).
3. Rendered `/collections/all` (or a collection with an image) at blur 0: the hero media layer and `<img>` carry the same attributes as before the change.
4. At blur 12: the `<img>` computed `filter` is `blur(12px)` and its scaled box overflows the frame on all four sides (checked by the reviewer from the rendered CSS); the user confirms no light or transparent edge at 390 and 1440.
5. After `npm.cmd run build:tw`, `git diff -- assets/tailwind.output.css` is staged with the batch or empty.
6. `npm.cmd run test:layout` at 390, 768, 1024 and 1440 with `shopify:dev` running reports 0 new issues.
7. User: browser look at the collection page with the setting at 0 and above 0.

### Execution log

- Before-reference (taken before the first edit): hero layer was `<div class="pointer-events-none absolute inset-0" aria-hidden="true">`; `<img>` via `image` snippet with `img_class: 'h-full w-full object-cover'`, followed by `<div class="absolute inset-0 bg-scrim">`.
- a. Schema: done. `range` `image_blur` 0-20, step 1, `px`, default 0, after `fallback_image`; locale label "Image blur" and info added to `locales/en.default.schema.json`.
- b. Markup: done. Mechanism: section `{% stylesheet %}` rule `.collection-hero-img-blur { filter: blur(var(--collection-hero-blur)); transform: scale(1.3); }`, class passed through `img_class`, custom property `--collection-hero-blur: <n>px` in a `style` on the aria-hidden media layer. Chosen over Tailwind utilities so no generated CSS changes and the two pieces (filter, scale) stay in one rule. At 0 or no media: no `style`, no class (img_class stays the original string). Image attributes and `bg-scrim` unchanged.
- Scale 1.3: a Gaussian blur of radius r fades about 2r (40px at 20px) at the edge; at 98% opacity by 2 sigma. Scale 1.3 overflows 15% of the box size per side, which is at least 37px when the hero is 250px tall (taller on larger widths), so the frame's `overflow-hidden` clips the faded band. Residual: a hero under about 200px tall at blur 20 could show a faint edge; the user checks at 390 and 1440.
- c. Motion: no motion change (no transition or animation); `review-animations` not triggered.
- d. No stash, checkout or reset used.
- Validators: `lint:theme` passed; `lint:i18n` passed (including unused keys); `lint:liquid-syntax` passed; `scan:compat` passed (69 stylesheet blocks, 0 javascript blocks); `test:theme-check` 158 files, 1 offense (warning, `snippets/listing-page-hero-copy.liquid` VariableName, a file outside this batch); `npx prettier --check sections/collection.liquid locales/en.default.schema.json` passed.
- `build:tw` ran; `git diff --stat -- assets/tailwind.output.css` empty. `git diff --stat`: `sections/collection.liquid`, `locales/en.default.schema.json` plus record files.
- `test:layout --widths 390,768,1024,1440`: NOT RUN to completion. Output: "Could not reach http://127.0.0.1:9292". The dev server was not listening there; per instruction I did not start one. Needs the user to start `npm run dev`, then rerun.

### Review 1 (coordinator session, 2026-11-02)

- Diff: only `sections/collection.liquid` (hero layer, one `{% stylesheet %}` rule, one schema setting) and `locales/en.default.schema.json` (label, info), plus record files. Schema matches the plan. At 0 the `img_class` string and the layer markup are the original.
- Validators rerun: `lint:theme`, `lint:i18n`, `lint:liquid-syntax`, `scan:compat` exit 0; `npx prettier --check` on both files clean; `git diff --stat -- assets/tailwind.output.css` empty. `test:theme-check`: 158 files, 1 warning (`VariableName`, `snippets/listing-page-hero-copy.liquid`). That file is unchanged since `e74e752`, so the warning is pre-existing and outside this batch.
- `npm run dev` was not running; the coordinator restarted it. `shopify.theme.toml` was missing: the coordinator's branch sync earlier on 2026-11-02 checked out `926dddb`, which still tracked the file, then fast-forwarded to `81c5c1e`, which does not, and Git removed it. Restored from `git show 926dddb:shopify.theme.toml` (one `store` line); the user confirms any other local content.
- `test:layout --widths 390,768,1024,1440`: 1 new issue, `collection-all` `page-margin` at 1024. This is the same off-grid toolbar nav-link entry accepted in RR1-E. `test:layout --page collection-all` over the full grid: 0 new, the 3 baseline entries (1320, 1920, 2360). Accepted residue, as in RR1-E.
- Check 3: rendered `/collections/all` at default 0 has no `--collection-hero-blur` style and no blur class. No collection on the dev store has an image and no `fallback_image` is set, so the image branch does not render without merchant content changes.
- Check 4 (Cursor browser; Chrome DevTools MCP was not available, degraded source). An image with the batch's classes was injected into the hero layer on `/collections/all` in memory, then the page was reloaded. The section rule ships (found in the page stylesheets); frame `overflow: hidden`. At 1600 wide (frame 1600×301): computed `filter: blur(12px)` and `blur(20px)`, transform `scale(1.3)`, overflow 45px top and bottom, 240px left and right. At 390 (frame 358×198): overflow 30px top and bottom.
- Finding F1 (must-fix under the bar "no faded edge above 0"): `scale()` gives overflow proportional to the frame, but the blur fade is fixed in px (σ = the blur value; an edge reaches about 98% opacity at 2σ). At 390 with blur 20 the overflow is 30px = 1.5σ, so the frame edge is about 93% opaque: a faint light band at top and bottom. Blur 12 at 390 (2.5σ, about 99%) passes. A hero with no description is shorter and fades more.
- Fix methods: (a) raise the scale (about 1.5 covers a 160px-tall hero at blur 20, at the cost of more crop of an image that is blurred anyway); (b) replace the scale with an overflow tied to the blur value (the image box extends `2 × --collection-hero-blur` beyond the frame on each side), which holds at every size. (b) is a method the plan does not name, so it needs the user's choice.

#### Correction 1 (implementer, 2026-11-02)

- Fix for F1, method (b). Rule replaced in the `{% stylesheet %}` of `sections/collection.liquid` (nothing else touched):
  `.theme-image > .image_img.collection-hero-img-blur { position: absolute; top: calc(-2 * var(--collection-hero-blur)); left: calc(-2 * var(--collection-hero-blur)); width: calc(100% + 4 * var(--collection-hero-blur)); height: calc(100% + 4 * var(--collection-hero-blur)); max-width: none; filter: blur(var(--collection-hero-blur)); }`. `scale()` removed.
- Why it wins: `snippets/image.liquid` has its own unlayered rule `.theme-image > .image_img { width: 100%; height: 100% }` (specificity 0,2,0), which a bare `.collection-hero-img-blur` (0,1,0) would lose to regardless of Tailwind layers. The selector above is 0,3,0 and unlayered, so it beats that rule and the layered Tailwind `h-full w-full` and preflight `max-width: 100%`. Absolute offsets are used instead of margins because the wrapper (`.theme-image`, forced `absolute` by `!absolute`) is the containing block; the wrapper's own `overflow: hidden` clips the enlarged box at the frame edge. `object-cover` (Tailwind class, still on the img) still applies to the enlarged box, so it fills.
- No motion change (no transition or animation).
- Checks: `lint:theme` passed; `scan:compat` passed (69 stylesheet blocks, 0 javascript blocks); `test:theme-check` 158 files, 1 warning (`snippets/listing-page-hero-copy.liquid`, pre-existing); `npx prettier --check sections/collection.liquid` passed; `git diff --stat`: `sections/collection.liquid`, `locales/en.default.schema.json` (from the first pass) plus record files `docs/agent/board.md`, `docs/agent/context.md`.
- `test:layout --widths 390,768,1024,1440`: 1 new issue, `collection-all` `page-margin` at 1024 (the accepted RR1-E residue); all other pages 0.
- Unverified: rendered result above 0 (no collection image or fallback image on the dev store; no screenshots per instruction). The user checks edges at 390 and 1440.

### Correction review (coordinator session, 2026-11-02): PASS

- Diff since Review 1: only the `.collection-hero-img-blur` rule in `sections/collection.liquid`; markup, schema and locales unchanged.
- Rerun: `lint:theme`, `scan:compat`, `lint:i18n` exit 0; `npx prettier --check sections/collection.liquid` clean.
- F1 retest (Cursor browser, degraded source; `/collections/all`, the real `image` snippet markup injected in memory: `.theme-image` wrapper with `data-image-mode="frame"`, `img.image_img` with the batch classes, then reload). At 390 (frame 358×198): blur 1, 12 and 20 give overflow 2, 24 and 40px on all four sides, that is 2σ at every value, so the frame edge is about 98% opaque; wrapper is `absolute`, `overflow: hidden`, and matches the frame; `object-fit: cover`. At 1440 (frame 1377×301), blur 20: 40px on all four sides; no horizontal page scroll. F1 closed.
- Open: check 7, the user's browser look with a collection image or `fallback_image` at 0 and above 0.

#### Amendment A1 execution (implementer, 2026-11-02)

- Task 1 Schema: done. `image_blur` default 0 -> 10; new `range` `image_scrim_opacity` after it (0-100, step 5, `%`, default 50); locale label "Image overlay opacity" and info added to `locales/en.default.schema.json`.
- Task 2 Markup: done. The hero scrim is now `<div class="absolute inset-0 bg-scrim-solid" style="opacity: {{ value | divided_by: 100.0 }}">`, rendered only inside the "hero has media" branch and only when the setting is above 0 (at 0 no element). Mechanism: inline `opacity` style, not a custom property plus stylesheet rule: it is a single use, needs no new CSS or class, and the value is a plain number from a range setting (no raw colour literal; colour comes from the `bg-scrim-solid` role). `divided_by: 100.0` keeps a float (50 -> 0.5). Blur markup and rule untouched. `bg-scrim` token and other consumers untouched.
- Task 3: no motion change.
- Checks: `lint:theme` passed; `lint:i18n` passed (plus unused-key lint); `lint:liquid-syntax` passed; `scan:compat` passed (69 stylesheet blocks, 0 javascript blocks); `test:theme-check` 158 files, 1 warning (`snippets/listing-page-hero-copy.liquid`, pre-existing); `npx prettier --check sections/collection.liquid locales/en.default.schema.json` passed; `git diff --stat -- assets/tailwind.output.css` empty; `git diff --stat`: `sections/collection.liquid`, `locales/en.default.schema.json` plus record files.
- `test:layout --widths 390,768,1024,1440` (server reachable): 1 new issue, `collection-all` `page-margin` at 1024 (accepted RR1-E residue); all other pages 0.
- Unverified: rendered hero with an image (none on the dev store), blur 10 and overlay 50% look; the user's browser look.

#### A1 review (coordinator session, 2026-11-02): PASS

- Diff matches the A1 surface: the schema (`image_blur` default 10, `image_scrim_opacity` 0–100 step 5 `%` default 50), two locale strings, and the hero scrim as `bg-scrim-solid` with inline `opacity: value / 100.0`, omitted at 0, inside the media branch only. `bg-scrim` and `tailwind/` untouched.
- Rerun: `lint:theme`, `lint:i18n`, `lint:liquid-syntax` exit 0; `npx prettier --check` on both files clean. `.bg-scrim-solid` already exists in `assets/tailwind.output.css`; `git diff --stat -- assets/tailwind.output.css` empty (no `build:tw` rerun: auto-review blocked it as a generated-file write outside the A1 surface).
- Rendered `/collections/all` (no image): hero layer unchanged, no `style`, no scrim element.
- Cursor browser (degraded source), in memory: the old `bg-scrim` computes to `rgba(0, 0, 0, 0.5)` at opacity 1; the new element to `rgb(0, 0, 0)` at opacity 0.5. Both composite to the same 50% black, so the default look and the hero copy contrast are unchanged.
