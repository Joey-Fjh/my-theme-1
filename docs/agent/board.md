# Work Board

This board holds only what is not yet decided: the one active decision, evidence that has not become a plan, and deferred ideas. `docs/agent/context.md` holds the plan under execution, or no plan; extra plans may coexist only when each is executed and waiting on verification the agent cannot perform (`AGENTS.md`, Record-layer checks). Recording a plan does not authorize implementation. Project identity, scope, accepted direction, and overall status belong in `docs/project.md`; completed execution history belongs in Git.

Last updated: 2026-10-13.

## Open decisions

**Decided: order of work, revised (user, 2026-10-13).** The work is two tracks. The framework track closes first; the theme track follows or runs beside it. This replaces "finish this repository first, then the skeleton backport" (2026-10-08) and the "after the second submission" timing under the backport candidates.

- **Track A, framework (reusable by every theme): five items to 100%, in this order.**
  1. **Framework browser smoke pass.** It checks that the framework works, not the design: module loading, dialogs, cart, variant change, console errors. It runs first, so a framework defect is fixed once, before the backport. Read-only, run from an external execution prompt (user, 2026-10-13: costly tasks get a prompt).
  2. **6-T4b**, `test:layout` in CI.
  3. **Repository setup automation**: ruleset JSON, setup script, and a `doctor:agent` check (see the backport candidates).
  4. **Redundancy audit and tidy-up** (user, 2026-10-13): survey the lint tools and the documents (`AGENTS.md`, `docs/references/`, `.agents/`, this board) for redundant or stale content and tidy them, so the skeleton receives a clean set.
  5. **The skeleton backport itself**: settle the candidate list, move the files, and run the skeleton's validators. After it, new themes can be developed from the skeleton in parallel with this theme.
- **Track B, this theme:** the polish pass (home, then product and collection), the consolidated browser pass with the full Lighthouse measurement including desktop, the readiness review, and the second submission. None of it changes the framework.
- **Accepted risk:** a framework defect found during the polish pass after the backport is fixed in both repositories.

**Open: redundancy audit results (Track A item 4; two read-only surveys at `fccc794`, 2026-10-13; the full reports were given in chat and are not kept).** Nothing is changed yet; the user decides what the tidy-up batches take.

- **Documents:** 24 duplications, 27 stale statements, 12 contradictions between documents.
  - **This board:** of 487 non-blank lines, about 280 are finished history already in Git, about 74 hold durable decisions that should move to an owner first (`docs/project.md`, `AGENTS.md`, a reference), and about 127 are open or deferred. Two blocks titled "Open" are closed.
  - **`docs/project.md` Progress:** about 8 of 40 lines carry current status.
  - **`docs/references/style-system/css-architecture.md`:**
    - the `lint-allow` table lists 3 exceptions that no longer exist and omits 11 real ones;
    - the font weight rule is stated three ways (400 and 700 only, against the 500 that ships);
    - the typography section still describes the legacy tiers as the system;
    - the "Skeleton carry-over decisions" table splits the "Layer Ownership" table.
  - **`docs/references/architecture/javascript-runtime.md`:** omits the toast store, the dialog layer and the Intersect plugin, and says the cart page is the only cart presentation.
  - **`docs/references/architecture/motion-architecture.md`:** says the template ships no drawer or dialog overlay.
  - **The phase 0 browser checklist (deleted in 6-V9):** listed deleted sections and targeted commit `926dddb`.
  - **Not portable to the skeleton as written:** batch ids used as section names and reasons (31 in `css-architecture.md`, 8 in the check-theme-architecture `SKILL.md`), and theme or machine specifics in `AGENTS.md` (`assets/scatter-gallery.js`, the Windows workspace).
- **Tooling:** 75 checks: 64 strict, 10 ratchet, 1 report-only; 65 generic, 10 carrying theme data. The earlier audit's conclusions still hold.
  - **Two latent defects (no theme file triggers them today):**
    1. Five schema-block extractors behave two ways. A section written with `{%- schema -%}` silently skips `dead-setting` and `section-color-scheme`.
    2. Two font-size rules disagree in stylesheet blocks. `font-size: var(--type-step-1)` is documented as allowed but fails `settings-chain-css-typography`.
  - **Dead or inert code, about 190 lines:**
    - the ratchet machinery for `dead-setting`, whose baseline is empty;
    - the strict checks `legacy-breakpoint` and `mixed-element` still running through the ratchet loop, with hints that say "once 6-C2 / 6-C8 lands";
    - a function used only by its own test;
    - unused imports;
    - 37 exports with no importer.
  - **Copied helpers:** `lineAt` ×12, `formatPath` ×8, the baseline machinery ×3, three class-token extractors, five Liquid file lists that differ (`templates/gift_card.liquid` and a future `blocks/` fall outside the migration and ownership checks).
  - **Gaps:**
    - `test:layout-harness` runs nowhere;
    - the tooling's own code is neither linted nor format-checked;
    - `lint:theme` prints the check id only for the bracketed checks;
    - the `AGENTS.md` Validation table omits `test:validators`, `test:layout-harness` and `scan:contrast`.
  - **Theme data inside the tooling, to move to config at the backport:**
    - the `width: 'full'` allowlist (8 sections);
    - the badge colour allowlist;
    - the `recipient.form.` locale prefix;
    - the placement groups;
    - the layout-check config and baseline;
    - the contrast pairs;
    - the Lighthouse handles.
- **Also for the backport:** the candidate list under Evidence (checked 2026-10-04) predates `test:layout`, Lighthouse CI, `review-animations`, the 6-C and 6-V lints, the dialog layer and the design chain, and its "not a candidate: CSS step 3 rules and primitive snippets" conflicts with treating `css-architecture.md` as framework.

**Done: tidy-up batches A and 6-V9** (2026-10-13).
- **A:** the board and `docs/project.md` pruned of finished history (`e1bb95d`).
- **6-V9:** the references, the check-theme-architecture `SKILL.md`, `README.md` and `docs/project.md` corrected against the code, and the phase 0 browser checklist deleted (`23486ed`, `fad2935`; plan and reviews: `git show b07c323:docs/agent/context.md`; independent review PASS on round 2).

**Open: findings from 6-V9 (2026-10-13), for the user.**

- **Possible defect, loading spinners do not rotate.** `snippets/loading.liquid` and `snippets/buy-buttons.liquid` use the class `animate-spin`. `tailwind/tailwind.input.css` resets `--animate-*: initial`, and `assets/tailwind.output.css` has no `.animate-spin` rule (`grep -c` gives 0; only `.animate-spin-slow` exists). The `.spinner` / `.spinner-lg` recipe in `tailwind/tailwind.animates.css` has no consumer. Not confirmed in a browser. It is framework-level, because the loading snippet is shared, so classify and fix it before the backport.
- **Rule conflicts, reported and not decided:**
  1. **`motion_enabled` scope.** The code stops reveals, marquees, autoplay, tilts and zooms. Dialog and drawer motion follow only `prefers-reduced-motion`. `docs/design/design.md` says overlays appear without travel when the setting is off, which is not implemented. `docs/project.md` is right about overlays, but its list of what the setting stops is shorter than the code.
  2. **Extraction threshold.** `docs/references/architecture/abstraction-boundaries.md` waits for a third consumer before generalizing a JS abstraction. The shared carousel controls entry here says to extract with the second.
  3. **Check widths.** `AGENTS.md` names 390 and 1440. `docs/design/design.md` names 375, 768, 1024 and 1440.

**Open decisions reviewed with the user (2026-10-12):**

- **CI (6-T4):** Shopify's official Lighthouse CI GitHub Action (`shopify/lighthouse-ci-action@v1`, Shopify Dev MCP, 2026-10-12) is wanted. It needs a development store dedicated to it, loaded with Shopify's test product CSV and nothing else, a Dev Dashboard app with `read_products` and `write_themes` (client ID and secret as repository secrets) and the store password; it audits home, a product and a collection on every push. The store and the app are the user's to create. `test:layout` is a geometry check (horizontal scroll, overflow, content outside the page margin, tap targets, clipped text, runtime errors), not a visual comparison; in CI it would need a storefront the runner can reach (the Lighthouse action's preview theme or a pushed theme). **Decided (user, 2026-10-12): `test:layout` joins CI** too, against a storefront the runner can reach. Explained to the user: CI does not stop a push (the commit still reaches GitHub); it blocks the merge into `main` once branch protection requires the checks, and the store only receives code that is deployed to it. CD (continuous deployment) is that deploy step (`shopify theme push` with a Theme Access password, or Shopify's GitHub integration syncing a branch to a theme); none exists today, and the Theme Store submission is a ZIP upload. **Decided (user, 2026-10-12): CI only, no CD.**
  - **Split (coordinator, 2026-10-13):** **6-T4a, Lighthouse only, is done** (`851ca19`; plan, runs and reviews: `git show 025f0f6:docs/agent/context.md`; independent review PASS on round 3). **6-T4b `test:layout` in CI** follows it and is not planned yet. Two facts shape it:
    - The harness targets `shopify theme dev` at `127.0.0.1:9292`. CI would instead push a development theme with the app token, set the preview cookie once, and run against the store URL. That needs a small harness option for the preview theme id, beside the existing `LAYOUT_BASE_URL` and `STOREFRONT_PASSWORD`.
    - ci-test content differs from the store the current baseline (42) was recorded on, so CI needs its own baseline file.

    First step before planning 6-T4b: one local run of `test:layout` against ci-test to see how stable the results are on test data.
  - **Lighthouse CI, first green run (2026-10-13, run 38363613541):** mobile medians are home 0.72 / 0.93, product 0.67 / 0.97, collection **0.48** / 0.96 (performance / accessibility); best practices is 0.59 on all three.
    - The job passes on the best of three runs, so green does not prove the Theme Store bar.
    - **For the polish pass and the readiness review:** classify the collection performance (LCP 5.5 s, TBT 890 ms) and the best-practices score before any code change.
    - **Development themes:** the action never deletes its development theme, because its cleanup tests a variable it never sets. Each push leaves one on ci-test until Shopify removes it after seven idle days. **Decided (user, 2026-10-13): leave it.** Revisit only if the leftovers cause a real problem. A later cleanup step should delete the run's own theme (`shopify theme delete --theme <id>`). The action exposes no outputs, so the id would have to be found another way; a blanket delete of all development themes is simpler but could remove one a concurrent run is using.
    - **Unused after the Theme Access change:** the `lighthouse-ci` Dev Dashboard app and the secrets `SHOP_CLIENT_ID` and `SHOP_CLIENT_SECRET`. Removing them is the user's choice.
  - **Done: 6-T4c Lighthouse trigger timing** (`e5c6ba2`, `1e3bc18`; plan, runs and reviews: `git show 9bd0b26:docs/agent/context.md`; independent review PASS, top-up PASS).
    - Lighthouse is its own workflow (`.github/workflows/lighthouse.yml`). It runs on pull requests into `main`, on pushes to `main`, and on manual runs. Development branch pushes run `CI` (Lint, Theme Check) only.
    - The manual run button appears once the file is on `main`.
    - The pull-request trigger was proven on draft pull request #21, which is closed and was not merged.
    - Rule wording: the validator wiring is "the workflows under `.github/workflows/`".
  - **Branch protection (explained to the user, 2026-10-13):** CI cannot stop a push. Only protection on `main` blocks a merge. **Done (user, 2026-10-13):** ruleset 13447964 requires a pull request and the `Lint`, `Theme Check` and `Lighthouse` checks, up to date; it blocks force pushes and deletion; the admin bypass applies to pull requests only. Workflow: `main` plus one short-lived branch per batch, no long-lived develop branch. New theme repositories from the skeleton do the same.
- **Submission:** the user submits when the theme is nearly done; not a coordinator decision.
- **External skills: done as 6-V7** (`7593ac0`; plan and reviews: `git show 7593ac0:docs/agent/context.md`; 2026-10-13; independent review PASS on round 2): vendor `review-animations` and give `frontend-design`, the GSAP skills and Chrome DevTools MCP named triggers. **Revised (user, 2026-10-13): `impeccable` is not vendored** (broad auto-trigger, generation commands, runtime binary download and hooks, about 2.2MB; facts in the plan). **Polish pass, first step:** run `impeccable` `critique` once on the home page in a separate session, with no hook installed and no files written to the repository. Its design-specificity verdict answers the Theme Store rejection. File the report here as evidence; adoption is decided on that evidence. `taste-skill` is not adopted (`design.md` holds the design language). A skill or server that finds no use keeps its place in the repository unchanged (user, 2026-10-12).
  - **Added to the map (user, 2026-10-12):** `taste-skill` joins stage 1 as a candidate beside `ui-ux-pro-max` (not adopted for this theme on 2026-10-12, because `design.md` exists; the same reasoning puts it at the skeleton backport). Playwright: stage 4 already uses it as the `test:layout` runner, and 6-T3 chose a manual checklist over Playwright flows; a Playwright MCP as an agent browser tool would overlap Chrome DevTools MCP, so it is listed for the skeleton evaluation only.
  - **Decided (user, 2026-10-12): this theme now:** adopt only what has a consumer in the coming polish pass: `review-animations` (`impeccable` revised 2026-10-13 to a one-off critique, above), plus triggers for `frontend-design`, the GSAP skills and Chrome DevTools MCP. Stage-1 generators (`ui-ux-pro-max`, `taste-skill`) and a Playwright MCP wait for the skeleton backport. Also decided: the stage-1 exception to "skills review, never generate" applies to the skeleton (named trigger: new theme or `design.md` draft; values mapped to our scales; the user chooses); those generators are evaluated and adopted with the backport.
- **Interaction tests (6-T3):** the user asked whether Playwright already covers it. `test:layout` uses Playwright for geometry only; 6-T3 would be scripted flows with assertions (variant change, add to cart, cart drawer, menu and dialogs with keyboard and focus). Coordinator proposal: a small set for launch-blocking flows only; location `.agents/tools/interaction-check/` beside the layout check (same Playwright runner, password handling and config shape), script `npm run test:interaction`, joining CI with `test:layout`. **Decided (user, 2026-10-12): a document, not automation.** The flows become a manual test checklist the user runs (steps and expected results for the launch-blocking flows: variant change, add to cart, cart drawer, menu, dialogs with keyboard and focus), not Playwright scripts. It follows Shopify's official theme testing checklist (user, 2026-10-12: consistent with the official documentation; read through Shopify Dev MCP when written). Location and timing: with the readiness review before the submission.
- **Skeleton backport** (user, 2026-10-12): when this project is mature. The backport adds the design chain (`design.md` → tokens → preset) to the skeleton; after it, themes are produced in batches and automatically, and the user steps in only where the result differs from the design, not to discuss code or tools again.

- **Decided (user, 2026-10-12): no computed-style tool.** The 6-R3 scripts are deleted. A batch that must prove "no rendering change" rewrites a comparison from the 6-R3 record (`git show 9bf1b64:docs/agent/context.md`): noise per (slot, element path, property), both sides through the online preview, the first slot of a run lands on `/`.

**Decided: order after 6-D2** (user, 2026-10-12: migration debt first, then build what is decided, the polish pass last, so the polish tunes code that is already on the framework and is not done twice). Coordinator inventory, 2026-10-12:

1. **Migration debt (ratchets to 0). Closed (user, 2026-10-13)** after 6-R5: `mixed-element` 0 (strict), `legacy-breakpoint` 0 (strict since 6-V6, `1370beb`; plan and review: `git show 1370beb:docs/agent/context.md`), `stylesheet-font-size` 1, `legacy-type-tier` 6, `raw-spacing` 2. What remains is design, not migration, and moves to the polish pass: `body-size-custom` (the 6 `legacy-type-tier` hits plus the countdown font size: display sizes 24/40, 24/32, 36/120 that no single step × factor reproduces), the `product-card` quick-view padding in viewport units (`raw-spacing` 2), and raw radii (43 `border-radius` declarations in stylesheets, about half semantic: `0`, `50%`, pill, `inherit`; the rest one-off values; only `--radius-card` / `--radius-media` exist, both from the merchant card radius). Deleting the alias tiers and the checks still needs the user's approval. History: **Done: 6-R1** (`7b835e3`; plan and reviews: `git show 616ddb9:docs/agent/context.md`): `legacy-breakpoint` 502 → 0, `legacy-type-tier` 398 → 6. Left: `raw-spacing` 658 / 80, `mixed-element` 135 / 39, `stylesheet-font-size` 15 / 6, `body-size-custom` 6, then deleting the aliases and checks (user approval). `mixed-element` moves with `raw-spacing`, because moving utilities into stylesheets would hide raw spacing from that ratchet. `body-size-custom` (6) goes to the polish pass. **Done: 6-R2** (`46358d3`; plan and reviews: `git show 46358d3:docs/agent/context.md`): `raw-spacing` 658 → 2 (the viewport-relative `product-card` padding), `step-4xl` added, layout baseline 38 → 42 (user-approved). Next: `mixed-element` (135 / 39), then `stylesheet-font-size` (15 / 6), radii, `body-size-custom`, then deleting the aliases and checks. **Done: 6-V5** (`336090b`; plan and reviews: `git show 336090b:docs/agent/context.md`): class tokens keep Tailwind arbitrary values whole (`p-[5%]`, `text-ink/[40%]` are now seen); counts unchanged. Words inside one arbitrary value are not classes (user, 2026-10-12). Visually neutral first, provable by equivalence: `legacy-breakpoint` 502 uses / 59 files (`pc:` / `fw:` to the token breakpoints), `legacy-type-tier` 398 / 57 (alias tiers to `title-*` / `copy-*`), `mixed-element` 135 / 39 (one owner per element). Then the value-changing ones, mapped to the nearest token with the shifts listed: `raw-spacing` 658 / 80, `stylesheet-font-size` 15 / 6, and raw radii in section stylesheets (no lint yet) to the 6-D1 radius tokens. Mechanical with fixed acceptance checks, so Sonnet executors fit.
2. **Decided, not built:** the autoplay pause button (WCAG 2.2.2). **Revised (user, 2026-10-13):** the rule is "a button only where no other way to pause exists". With a mouse, hover on the active control and keyboard focus pause it, so desktop shows no button (the design has none, by taste). Touch devices have no alternative at any width (a manual slide change does not stop autoplay), so the button shows under the `no-hover` condition `not ((hover: hover) and (pointer: fine))`, not below 1024px. Applies to `slides-show` and to `routine-showcase` (autoplay only at ≥1024px, so its button appears on wide touch screens such as a landscape iPad), through one shared pause control (the "shared carousel controls" idea below). Not shown when autoplay is off or reduced motion is on. A user pause persists through pointer leave and slide changes. `design.md` (Carousel controls, Motion) updated to match. **Done: 6-A1** (`2c7e28b`; plan and reviews: `git show 2c7e28b:docs/agent/context.md`; 2026-10-13; review PASS on the second round; also fixed a pre-existing `routine-showcase` stall after crossing the desktop breakpoint); `design.md` rules: **font families done in code** (checked 2026-10-13: no monospace or serif `font-family` in sections, snippets, layout or `tailwind/`; 6-D2 preset Instrument Sans); the remaining visual details move to the polish pass (user, 2026-10-13): the italic left from the design's monospace italic on `ritual-steps` step labels, eyebrows and prices, step labels as an ink-tinted chip, tabular figures for numbers; feature cards and media on the radius tokens (with the raw radii). **Found:** both font pickers in `config/settings_schema.json` default to `"mono"` (monospace) while `design.md` and the preset use Instrument Sans; **Done: 6-D3** (`b04dba5`; record: `git show b04dba5:docs/agent/context.md`; 2026-10-13): both schema defaults are `instrument_sans_n4` (Shopify Dev MCP: `mono` is the system monospace handle, `instrument_sans_n4` is in the library); review PASS; 6-T4 CI scope (`test:layout`, Lighthouse) decided before the submission.
3. **Polish pass last:** section by section against the design's look and `design.md`, the user's screenshots driving the visual corrections; the layout baseline (42) to 0, the three mobile rails, the collection tab bar; from the migration: `body-size-custom` and the countdown size, the quick-view viewport padding, raw radii (then `legacy-type-tier`, `stylesheet-font-size` and `raw-spacing` reach 0 and become strict).

    - **Done:** (1) the small validator batch, 6-V3 (see the Done line). **Decided (user, 2026-10-11):** (2) the ratchets (`legacy-type-tier`, `raw-spacing`, `legacy-breakpoint`, `stylesheet-font-size`, `mixed-element`; 1558 + 150 counts) are driven to 0 in the polish pass, and each check with its baseline entry is deleted when its count reaches 0 (deletion still needs the user's approval in that batch). (3) layout tool: the false positives were removed in 6-T5; the remaining baseline is design debt (below); 6-T4 is open.

**Layout check baseline: no known false-positive class left** (checked 2026-10-13; 6-T5 removed the two known false-positive classes, 63 → 32; 6-D2 and 6-R2 raised it to 42 with the user's approval). Of the 42 entries in `layout-check.baseline.json`, 38 are polish-pass debt and 4 are unconfirmed (tool or real; see below):
- `tap-targets` ×15 (home): the `featured-product` carousel Swiper pagination bullets ×10, under 24px (WCAG 2.5.8), and `scroll-categories` links ×5. Accessibility debt; stays a gate.
- `page-margin` ×26: home ×15 (`routine-showcase`, `ritual-steps` sticky and carousel, `testimonial-featured`, `collection-list`, two `featured-products` tab panels), `collection-all` ×4, `not-found` ×3 (heading, text, button), blog ×2 (tab panels), product ×1 (`product-comparison-table`), about ×1 (`testimonial-featured`).
- `clipped-text` ×1: home `featured-product` carousel.
- **Unconfirmed:** the four tab-panel entries (`featured-products` tab-0 at 680, tab-2 at 760; blog tab-1 at 360, tab-2 at 640) each fail at one width only; whether that is a measured hidden panel (tool) or a real overflow is not checked. Confirm with `test:layout` before the polish pass touches them.
- **Rail entries, deferred to the polish pass (user, 2026-10-11):** the user prefers one card per view on mobile (centred, page margin on both sides, swipe to the next), but three places change, not every rail, and the user names which. At the polish pass, list the candidates and ask: the `ritual-steps` and `routine-showcase` mobile rails (`card-rail`), the `collection-list` slide, the `featured-products` tab strip, the `collection-all` nav-link scroller, the `testimonial-featured` marquee. Until then these entries stay in the baseline, and the tool does not special-case scrollers.

**External design skills, background** (user idea, 2026-10-11; superseded by the decisions under Open decisions, External skills; the Figma and design-source decisions below still hold). Candidates: Paul Bakaus `impeccable` (design critique and audit, deterministic anti-pattern rules, Apache 2.0), Emil Kowalski `emilkowalski/skills` (`emil-design-eng`, `animate`, `review-animations`: motion craft, MIT), Leonxlnx `taste-skill` (`design-taste-frontend`: infers a design language from a brief, MIT); then a Figma and Playwright loop. User's framing: JS design is familiar ground, CSS needs outside experience, but avoid premature architecture. Coordinator proposal: an adoption rule like the vendored-library one (adopt a skill only with an accepted consumer batch; reference rank below Shopify sources and project rules, as `frontend-design`); Figma decides the style source first; then trial on the product page pilot, critique and motion review only, kept or dropped on evidence.
- **Agreed (user, 2026-10-11):** the skills review, never generate (Figma is the style source); the Figma question is settled first.
- **Decided (user, 2026-10-11): design input = frame PNGs + one REST full-file JSON per finalized design.** A plugin styles/variables export is dropped: it only holds styles the designer defined, and hardcoded values are likely. The REST `GET /v1/files/:key` snapshot carries every node (bounds, type, fills, auto layout), the same data the paid MCP serves, minus live queries; one call per design version fits the 6-per-month Starter limit, and the agent analyses the local copy without limit. The user runs the download in a local shell with a read-only personal access token that never enters chat or the repo. **The JSON is committed** (user, 2026-10-11: colleagues get it with the repo instead of each calling the API): `docs/design/<page>/figma-<page>.json`. `docs/` is already in `.shopifyignore` (not uploaded) and `.prettierignore` (not formatted), so no ignore rule changes; check the file size after download. PNGs stay Git-ignored under `docs/design/`.
- **Decided (user, 2026-10-11): we replace the designer.** `design.md` (`docs/design/design.md`, tracked) is settled by discussion between the user and the coordinator and is not handed to the designer. The current Figma file is the visual reference (user, 2026-10-11): its look, arrangement and hierarchy, never its values ("Decided: design source" still holds; values come from our scales). `design.md` takes its direction from it and corrects its defects; the Figma JSON statistics show intent (hierarchy, relative proportions, what repeats), not values to copy. **Later pages: PNGs only, no REST JSON** (user, 2026-10-11): with values out of use, the JSON adds nothing a screenshot does not; the home JSON stays committed (already pulled, re-pulling costs quota). References: `docs/design/references/` (Refero DESIGN.md: Isla Beauty, Beautiful, ARTU), patterns only, their scraped values are noisy. Later pages are designed by us against `design.md`. A designer's handoff standard is the checklist it must cover: colour, type and spacing systems, component states (hover, focus, disabled, error, loading, empty), responsive behaviour per width (375, 768, 1024, 1440), motion, accessibility, and do / don't rules.
- **design.md format (2026-10-11):** follow Google Labs' open DESIGN.md spec (alpha, `google-labs-code/design.md`, Apache 2.0): YAML front matter (`version`, `name`, `colors`, `typography`, `rounded`, `spacing`, `components`, token references `{colors.x}`), then `##` sections in order: Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts. Unknown sections are allowed, so ours (component states, responsive behaviour, motion, design defects) go after them. **Decided (user, 2026-10-11, Colors section):** the front matter lists the default preset values as documentation, with no agreement lint: code tokens are roles without values, the values live in the preset and belong to the merchant once installed, and they will be tuned after the browser look. The spec's `export` is not used. Colors also decided: one dark (the inverse scheme moves from `#1b2900` to ink `#263d29`, a preset change for the token batch); rating yellow is functional, not an accent. Gaps for the token batch are listed in `design.md` (Colors).
- **CSS layers (discussion, 2026-10-11):** design language (`design.md`: the brand's character, density, hierarchy, motion temper, do and don't), tokens (6-C1..C9), layout primitives (6-C5 page grid, `section-frame`), ownership (6-C6). The technical choice comes last. The missing layer is `design.md`. **Agreed (user, 2026-10-11):** the Figma pilot's first output is a `design.md` distilled from the design, approved by the user; the product page, the polish pass, and any review skill judge against it, not against a skill's own taste.

**Known limitation, accepted (6-V3, 2026-10-11):** the colour lints match CSS values with regular expressions, not a CSS tokenizer. Review rounds 1-5 of 6-V3 showed that identifier boundaries and CSS escapes cannot be modelled that way without new false positives: a longer function name with a numeric argument (`custom-hsl(1)`) is rejected, and escaped forms (`\rgb(1 2 3)`, `\68sl(1)`) are not decoded. Both behave as on HEAD; theme code has none of them. Revisit only if real code hits one (then a tokenizer such as postcss-value-parser, as its own batch).

**Filed for the product page (6-C6, 2026-10-10):** `snippets/buy-buttons.liquid` intended an outlined unbranded payment button in the purchase group (foreground border and text, transparent fill, muted hover). It never took effect because `button.shopify-payment-button__button--unbranded` (`btn-primary`, unlayered) won. 6-C6 deleted the dead declarations for parity; decide the look with the product page design.

**Done: 6-C6 stylesheet ownership** (2026-10-10, `e75f4d1`; plan and review rounds 1-5: `git show e75f4d1:docs/agent/context.md`): every `{% stylesheet %}` unlayered and winning over utilities, the `snippets` layer retired, rule B and the font-size rule in `css-architecture.md`, lints `stylesheet-layer`, `stylesheet-font-size` (ratchet 15 / 6 files) and `mixed-element` (ratchet 137 / 41 files). The polish pass migrates the mixed elements, the font sizes and the Tailwind single-owner blocks. Lesson for later batches: unlayered Tailwind rules (reduced motion, motion switch, marquees) compete with unlayered stylesheets by specificity and source order; a reduced-motion override a stylesheet must not beat goes under `prefers-reduced-motion: no-preference` in the owner.

**Decided: audit practice** (user, 2026-10-09).
- **Per CSS batch:** the scope discussion runs a three-part audit of its domain (bypasses of the chain, redundant or leftover code, rule holes). Findings go into the plan; the batch's baseline is cleared when it closes. 6-C4 is the first.
- **Before the second submission:** one cross-domain consolidation pass (the polish pass plus the readiness review).
- **Closed areas no later batch revisits** (JS runtime and modules, i18n, schema and settings, assets, `docs/references/` accuracy): one read-only audit by an external session (Sonnet), report outside the repo; the coordinator files the findings here by domain.

- **Per CSS batch from now on:**
    - the lints;
    - `test:layout` at a few key widths (`--widths`, for example 390,768,1024,1440);
    - the user's browser look at the pages and widths the plan names.
    - The full 57-width sweep runs before a release.

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

**Cleanup survey** (coordinator, 2026-10-06, read-only; for the cleanup batch):

- **Not placed in any template, but keep:**
    - `custom-liquid`, a merchant utility;
    - `pickup-availability` and `collection-navigation-items`, which are fetched through the Section Rendering API;
    - the social icons, which are named dynamically in `snippets/social-icons.liquid`.
- **User decision:**
    - **Decided (user, 2026-10-11): keep the other six as options.** Correction to this survey: three are still placed outside home, so they were never deletable: `before-after-comparison` (`page.about.json`), `about-stats` (`page.contact.json`), `newsletter-banner` (`article.json`, `blog.json`, `page.about.json`). `promotion-countdown`, `video-banner` and `google-map` are in no template but stay as merchant options; all six must meet the polish standard before submission. `blog-stories` stays on home without a redesign (user, 2026-10-07);
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
- **Testimonial marquee:** the native reduced-motion check on a real device (MCP emulation does not take effect).
- **Testimonial marquee seam:** with exactly 2 testimonials, half the track holds 3 columns (odd), so the column-offset alternation breaks at the loop seam (6-S7 R4).
- **Tier pairs and layout breakpoint:** in `scroll-categories`, the `pc:` / `max-pc:` tier and flex classes still switch at 768px, while the two-column layout now starts at 1024px. At 768–1023 the index sits beside the title in the stacked layout, and the image `sizes` still switch at `48rem` (6-S6 R12).
- **Step showcase (6-S8):**
    - the heading face (one design export shows a serif);
    - the vertical label shows the step label, while the design repeats the heading;
    - the badge sage is a scheme mix;
    - Treat and Protect have no second image in the dev store;
    - the arch ratio and the packshot box need checking against a real transparent packshot.
- **Stacked panels (6-S9):**
    - the design's pale sage (panel 1) against bright lime (panel 3) needs a fourth colour scheme (merchant configuration);
    - the serif heading face;
    - the sticky header overlaps the top of a stuck panel;
    - the small image position (now ending at about 72% of the panel; the design is at 85%);
    - the optional link's Tab reach was not tested with a configured link.
- **Sage colour scheme (6-S9, 6-S10):** the design's sage backgrounds have no scheme. The trust strip uses scheme-3 with a scheme-2 wave for now. A fourth (sage) scheme would serve 6-S3, 6-S5, 6-S6, 6-S9 panel 1 and 6-S10. The design's icons also use a lighter stroke than Phosphor regular.
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

- Browser pass status (2026-10-04). Three agent sessions (reports outside the repo: `C:\Users\Joey\AppData\Local\Temp\ceylune-phase5-cutoff-report.md`, `-report-part2.md`, `-report-part3.md`) found two regressions, both fixed: the home slideshow stage size (5-B1, `9c4dd05`) and, pre-existing on the live theme, the dialog close labels and the initial variant selection (5-B2, `6bfdc7c`). No open regression on dev. A suspected cart drawer Escape failure was a misread of the always-present `.cart-overlay-section` shell. The dev-only GraphQL 400 and `shop.app` 403 come from the `127.0.0.1` origin (absent through `?preview_theme_id=`). 6-M1 checks (M8): the cascade on collection, featured-products tabs, blog cards and recommendations; `motion_enabled` off; reduced motion; Theme Editor section reload; headings, text and images without motion; decorative loops unchanged. Still open: live side by side (the agent sessions stayed on the password form), no-JavaScript at 1440, most of G3 and G5, the 5-C3f keyboard focus sweep, the width matrix, product media Escape, reduced motion (the MCP cannot emulate it), facet history, stylesheet subsetting on a pushed theme (5-C1), and the rows Blocked for data, Theme Editor, Safari or configuration variants. Per-batch check lists from the closed batches: `git show fe4b986:docs/agent/board.md` (Evidence, "Consolidated browser pass"). Remaining rows: the retired phase 0 browser checklist (`git show 3652441:docs/migration/phase0/browser-checklist.md`); the manual test checklist is rewritten against Shopify's official checklist at the readiness review.
- Final browser pass, scroll-linked sections (user question, 2026-10-05): GSAP ScrollTrigger behaves the same across desktop engines. iOS Safari can differ through address-bar viewport resizing (ScrollTrigger refresh) and momentum scrolling. In the consolidated pass, scroll `scatter-gallery` and any later narrative section on a real iPhone through an unpublished pushed theme's preview link, because `127.0.0.1` is not reachable from the phone. Per-batch checks stay the user's own Chrome screenshots at 1440 and 390, plus a scroll in device mode.
- Final browser pass, tablet widths (user, iPad, 2026-10-05): the theme's `pc` breakpoint is 768px, so every section switches to its desktop layout on an iPad in portrait. 6-S6 moved `scroll-categories` to a 1024px layout breakpoint after it crowded there. In the consolidated pass, check each home section at 768–1024 (iPad portrait and landscape) for crowding and for hover-only behaviour on touch.
- Browser sweep environment: through the `shopify theme dev` proxy with an isolated MCP profile, `/cdn/shop/files/*` images, `/variants/<id>/?section_id=pickup-availability`, and `/search` return 401 until the storefront password is entered, which hides real image and section failures. Before a sweep, restart `shopify theme dev` if needed. The password lives in `.env` (ignored by `.gitignore` and `.shopifyignore`); scripts load it; agents never print its value in chat or records.
- Skeleton backport candidates (user, 2026-10-03; now Track A item 5, see "Decided: order of work, revised" above; policy in `docs/project.md`; checked against `skeleton/main` `5191a50` on 2026-10-04):
    - the merchant JSON `.prettierignore` exclusion;
    - 5-S (entry scripts snippet, `2e0cddd`): the snippet, the layout render, and the lint that reads the import map from it;
    - H (5-H, `2683402`): `holdUntilReady` in the adapter, `holdForModule` and download-ahead `scanModules` in `base.js`, no mount after a failed import, the moved-lazy-root observer fix, and the matching `javascript-runtime.md` contract. H also closes two skeleton gaps found here: `scanModules` activating an already-loaded container root before deferring its descendants, and module roots in `<template>` content never being scanned;
    - the validator additions that guard the items above (in `theme-contracts.js`, `theme-architecture.test.js`, `doctor-agent.mjs`); the style ownership and settings-chain additions stay here;
    - the Chrome DevTools MCP adapter entries (5-T1) and the `frontend-design` skill.
    - **Repository setup automation (user, 2026-10-13; proposal, not built):** a new theme repository should not depend on remembering today's manual steps.
        - The `Lighthouse` workflow (`.github/workflows/lighthouse.yml`) travels with the skeleton. Its handles are constant, because every theme uses the same `ci-test` store.
        - The `main` ruleset is kept as a JSON file and imported by a setup script through the GitHub API. Today's ruleset is id 13447964: no deletion, no force push, pull request required, required checks `Lint`, `Theme Check` and `Lighthouse`, strict up-to-date, admin bypass for pull requests only.
        - The same script prompts for the three secrets (`SHOP_STORE`, `SHOP_ACCESS_TOKEN`, `SHOP_PASSWORD`). The values go straight to GitHub and never into a file.
        - `doctor:agent` fails when a secret name or the ruleset is missing, and names the setup script.
        - A short README section, "new theme repository setup", points to the script.
        - This is not a Batch SOP step: it is a one-time bootstrap. The one-time store setup (store, CSV, Theme Access) is not repeated.
        - **Hotfix flow, explained to the user:** with protection on, a fix on `main` goes through a short `fix/` branch and a pull request. The admin pull-request bypass is the emergency path. Afterwards, merge `main` back into the development branch.
    - Not a candidate (user, 2026-10-04): the CSS step 3 rules and primitive snippets (5-C3a–5-C3g, 5-B1). They serve this theme's section-block model; the skeleton composes with Theme Blocks as components (as Horizon does) and keeps snippets as code fragments. A GSAP adapter is judged after the home page narrative is built.
    - Timing: Track A item 5, see "Decided: order of work, revised" above (this replaces the earlier coordinator proposal of after the second submission).
    - Already covered by the skeleton reference, not applied here: `javascript-runtime.md` recommends `modulepreload` for a first-viewport module chain that the page truly needs before interaction.
- Layout harness candidate (cross review 2 of 6-T1, 2026-10-08): a scroller item fully inside the viewport but inside the page margin, cut by its own scroller, is still reported under the viewport-based peek rule (2 `collection-all` nav-link entries in the baseline). A scrollport-visibility exclusion would change the plan's page-margin rule; decide it in a later harness plan. Second case (6-C2, 2026-10-08): `ritual_steps_carousel` mobile rail card 2, product title link at 768. The full sweep never tests 768, and the user chose not to add it to the baseline for now.

## Deferred ideas

- Platform-agnostic front-end engineering skill (user, 2026-10-11): after the skeleton backport, extract what is not Shopify-specific (the `design.md` → tokens → layout primitives → ownership chain with its lints, and the JS model around lifecycle, state ownership, events, network outlets and components) into a skill usable for mini-programs, apps and desktop, with a per-platform adapter layer (rendering model, styling limits, routing, storage, review rules). Extract only after the method has run on at least two consumers (this theme and the skeleton or a second project), so the abstraction follows evidence. Creating a skill needs the user's explicit approval (`AGENTS.md`).

- Section cleanup sweep (user, 2026-10-05): sections the redesign takes off the home page stay in the theme for now (`category-grid` is deleted in 6-C10). After the design phase, review which sections no template uses or no design needs and decide removals in one batch.

- Looping media video (user, 2026-10-05): `snippets/media-video.liquid` already covers autoplay, loop, muted, no controls and optional play/mute buttons. Add a "play when in viewport" parameter (a small module) when a section design first needs a GIF-like video. WCAG 2.2.2 still needs a pause mechanism (at least a focus-revealed pause button, as in the marquee); with reduced motion show the poster.

- Design phase, home page scroll narrative (user, 2026-09-30; the GSAP foundation landed in 6-S5, `a2424d4`, so later narrative sections reuse `motion-gsap.js`; **Three.js closed** (user, 2026-10-08): no requirement uses it, and a library is vendored only when an accepted consumer exists): the user expects GSAP (ScrollTrigger) to be required and possibly Three.js. Compatible with H: a section module (`data-module-id`, typically `data-module-lazy`) loads the library inside its component through an adapter, as `carousel-swiper.js` does for Swiper; H only guarantees the component definition. Constraints from existing rules: the motion reference must classify the work as complex choreography before GSAP; first frame rendered in Liquid and visible without JS; `prefers-reduced-motion` and `motion_enabled` honoured; a Three.js canvas must not be the LCP element (poster image first) and should initialize when visible and idle; vendoring follows `THIRD_PARTY_NOTICES.md`. Full-page loading of these libraries would weigh on every page and on the Lighthouse bar, so on-demand loading is required for them. Loader choice (user question, coordinator answer 2026-09-30): own implementation (H) over Async Alpine, which would change every module; revisit if loading strategies grow beyond eager, visible, idle, or if `interceptInit` changes in an Alpine upgrade. **Vendored library upgrades** (user, 2026-10-07): none by default. Alpine, Swiper and GSAP are upgraded only to fix a bug in the library itself, since the theme needs only what Shopify storefronts use. Runtime tests are the open JS gap, to be decided after the CSS specification.

- CSS craft (user, 2026-09-29): architecture is considered sound, but CSS implementation lacks detail. Coordinator view: the gap is a missing design specification (direction, type scale, spacing rhythm, state rules). `frontend-design` is vendored as a design reference below the project rules (`AGENTS.md`, Agent Skills); the Vercel Web Interface Guidelines were not evaluated. The design phase writes that specification.

- Design phase: the DesignSync tool (user-started `/design-sync`) syncs a local component library with a claude.ai/design design-system project (token and component preview cards). It does not build CSS; it could host the token and key-component previews while iterating on the visual direction the Theme Store review asked for.

- **Carried from pruned history (2026-10-13):** **Open:** whether the second submission waits for the design pipeline, or ships with today's values plus the polish pass.
- **Carried from pruned history (2026-10-13):** **Sites reviewed** (the user's bookmarks): Refero (screen library plus Refero Styles, DESIGN.md-style specs of real sites; the official MCP needs a paid Pro, Team or Lifetime plan), Lovart and Stitch (AI design output: images, SVG, PSD), Godly, Dribbble and Pinterest (inspiration), React Bits, Aceternity and MotionSites (React components: motion reference only, the stack rule excludes React), Uiverse (plain CSS snippets). Added by the coordinator: Utopia (`utopia.fyi`, fluid type and space scale calculator, the user is adding it), ecomm.design, Commerce Cream, Baymard, Typewolf, Realtime Colors, and the Theme Store as a distinctiveness check.
- **Carried from pruned history (2026-10-13):** **Root size:** the 62.5% root has no primary-source endorsement with Tailwind, and px-valued body tokens ignore the user's default font size. Not a blocker; revisit with the type token batch.
