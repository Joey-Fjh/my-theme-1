# Work Board

The board is where work is discussed, researched and planned before it becomes a plan. Each topic carries its evidence, options and current leaning, and a status line (`discussing` or `awaiting user`, with the dates it was opened and last updated). When the user decides, the topic leaves the board in that change: into a plan in `docs/agent/context.md`, one line in `docs/agent/backlog.md`, a line under Pending migration, or deletion. Recording a plan does not authorize implementation. Project identity, scope, accepted direction, and overall status belong in `docs/project.md`; completed execution history belongs in Git.

Last updated: 2026-10-27.

## Topics

### LS1: media frame and section height against review and readability

Status: awaiting user · Opened: 2026-10-27 · Updated: 2026-10-27

User, 2026-10-27: the first answer was too narrow. This is not an image-only question. It ties to in-container spacing and to the container's outer limit. Every media-led section (images, video) needs an answer, not only the product page. No test images at 16:9, 4:3 or 1:1 exist yet.

Three-layer frame (the second round of evidence below follows it):

1. **Outer:** how tall a section may get.
2. **Media box:** ratio, fit and crop.
3. **Inner:** content position and gaps inside the container.

Second round, 2026-10-27:

- **Official, crop safety.**
    - Shopify `focal_point`: "The focal point will remain visible when the image is cropped by the theme".
    - `image_tag` applies it as `object-position` automatically.
    - `snippets/image.liquid` keeps it unless a caller passes `position`.
    - So a fixed design ratio with `cover` is a sanctioned approach for editorial media. Product media is the exception, because the product itself must not be cropped (Dawn contain, Horizon adapt).
- **Official, Horizon as one system** (`sections/hero.liquid`, `blocks/group.liquid`, `blocks/image.liquid`):
    - Outer: `section_height` is auto, small, medium, large, full-screen or custom svh (hero default medium; `media-with-content` default 80svh).
    - Media: the image block `image_ratio` is adapt (default), portrait 4/5, square or landscape 16/9, with `cover`. Background media is `cover` or `fit`; video is `cover` or `contain`.
    - Inner: every section and group carries direction, horizontal alignment, vertical alignment (start, center, end, space-between; default center), `gap` 0–100 (default 12) and padding.
- **Ours, inventory of the 26 sections with an image or video setting** (schema scan):
    - Outer:
        - Height is set by padding plus `height_kind` (content, stage, media).
        - Only `slides-show` (`section_height`) and `video-banner` (adapt) offer a height setting.
        - Media-led sections size from a fixed-ratio media box tied to the column width, so they grow without a cap on wide screens: `routine-showcase`, `ritual-steps`, `scatter-gallery`, `promo-bannder`, `editorial-collage`, `formula-details`, `mood-finder`.
    - Media:
        - Most hard-code the design ratios (`417 / 254`, `2 / 3`, `0.72`, `1607 / 1010`) with `cover`.
        - Ratio settings exist only on `product` (3:4, 1:1), `before-after-comparison`, `video-banner` and `slides-show` (adapt).
    - Inner: no media-led section offers content position or gap. Positions follow the design per section (for example `routine-showcase` uses space-between); only `icon-with-text` has gap settings.

**Principles accepted (user, 2026-10-27).**

1. **Outer:** media-led sections cap their media in svh on desktop.
2. **Media:** product media adapts by default and is never cropped. Editorial media keeps the design ratio with `cover` plus the focal point.
3. **Inner:** where the media is taller than the content, the content position and the gaps come from design tokens; merchant settings are added only where needed.

**Audit against the principles** (DevTools at 1440×900, 1920×1080 and 2560×1440 on home, product and about; schema and markup scan; 2026-10-27).

- Correction to the first round: sections inside `container-page` stop growing at the page container (about 1600px). For example `before-after-comparison` and `newsletter-banner` are 1600×900 at both 1920 and 2560. The risk is the media ratio against the viewport height, not unbounded width.
- **Outer:**
    - `main-page-about` hero: 1.32vh at 1920. The full-width image follows its ratio with no cap.
    - Product main gallery: already capped by `desktop_media_height`. The section is 1.29vh because of the content below the gallery, which is fine.
    - Designed, not defects: `slides-show` is a 100svh stage; `ritual-steps` and `promo-bannder` are sticky scroll stages of 3vh.
    - `featured-product` media column: 0.89–1.10vh.
- **Media:**
    - `product` (3:4 or 1:1, `cover`) and `featured-product` (hard-coded `aspect_ratio: '3/4'`) crop product media. Product cards already offer adapt (`product_card_image_ratio`).
    - Editorial sections render through `snippets/image.liquid`, so the focal point applies, except where a caller passes an explicit `position` that overrides it: `brand-statement` (`center`) and `routine-showcase` (`bottom`). The `collection` and `search-results-tabs` hits are to be checked (they may not be image renders).
    - Files that call `image_url` without the image snippet are logos, icons, swatches and meta tags (out of scope).
- **Inner (largest empty run inside one text column):**
    - `routine-showcase`: 347 / 561 / 921px at 1440 / 1920 / 2560. Heading at the top, product at the bottom (`space-between`); the arch is about 0.5vw wide at a 1:2 ratio.
    - `featured-product`: about 440px, with the info column shorter than the media.
    - Candidates to confirm visually: `testimonial-featured` (694 at 1920), `mood-finder` (384), `formula-details` (323), `promise-section` (244).
    - Blog and card grids show large values only because the cards stack text under images; those are not gaps.

Scope options (estimates; tier Ask, since Liquid, schema and locale change):

- **LS1-A, product media (review risk, about 4 h):**
    - Add `adapt` to `media_aspect_ratio` and make it the default.
    - Use `contain` under the viewport cap.
    - Make `featured-product` follow the same setting or adapt.
    - Verify with canvas-generated 16:9, 4:3, 1:1 and PNG images substituted in DevTools (no upload).
- **LS1-B, outer and inner on the flagged sections (about 3 h):**
    - `routine-showcase`: an svh cap on the arch and the content position from a token, where centre or top-with-gap replaces `space-between` past a height.
    - `main-page-about` hero: an svh cap.
    - `featured-product`: info column position.
    - Remove the explicit focal overrides where the design does not need them.
    - Confirm the four candidates.
- **LS1-C, a shared outer and inner contract in `snippets/section-frame.liquid` for every media-led section (about 5 to 6 h):** polish pass.

Leaning: A and B as one batch through an external execution prompt; C stays in the polish pass.

Trigger: BP1 part B (user screenshots 1 and 4, about 1872×1307). The left text column of `routine-showcase` leaves a large empty band. A product with one packshot shows a tall frame with empty space under the product, and the description falls below the fold. The user asks how the official themes and the industry mainstream judge it.

Evidence, ours (DevTools, 2026-10-27):

- **Product media** (`sections/product.liquid`):
    - `media_aspect_ratio` offers only `portrait_3_4` (default) and `square_1_1`.
    - The image is `object-fit: cover`, so a 16:9 image keeps about 42% of its width in the 3:4 frame.
    - `desktop_media_height: balanced` caps the frame to the viewport: 748×810 at 1440. At 1872×1307 the gallery ends at 1310 and the description starts at 1330, below the fold.
- **`routine-showcase`** at 1872×1307:
    - The arch is 485×969 and sets the section height (1141).
    - The left column ends its heading group at 196 and starts the product block at 794: about 600px empty.

Evidence, official:

- **Theme Store testing checklist** (shopify.dev, test-theme/checklist):
    - Product page: test 16:9, 4:3, 3:2 and 1:1 portrait and landscape, and a PNG.
    - Unique sections: "Each section supports varying image qualities and ratios".
- **Dawn** `sections/main-product.liquid`: `media_fit` contain or cover (default `contain`); `constrain_to_viewport` (default `true`); `media_size` small, medium or large.
- **Horizon** `blocks/_product-media-gallery.liquid`:
    - `aspect_ratio` options: `adapt` (default, labelled auto), portrait `1/1.25`, square, landscape `2/1`.
    - `constrain_to_viewport` default `false`, labelled "Limit media to screen height".
    - `media_fit` cover or contain, shown only for `adapt` plus constrain.
- **Dawn** `image-with-text`:
    - Height `adapt` (default) follows the image ratio; small, medium and large are the alternatives.
    - `desktop_content_position` is top, middle or bottom, default top.
- **Horizon** `media-with-content`: `media_height` auto, 50, 60, 80 (default) or 100 svh. Content placement lives on the content block, and the presets use `space-between`, the same pattern as `routine-showcase`, inside an 80svh cap.

Evidence, industry (weak):

- Baymard's product-page findings that bear on this: 56% of test users looked at the images first; heavy crops hide what a feature is.
- Its image gallery guidelines (default image size, crops) are paywalled, and no free source states a ratio rule.
- Horizon (2025) is the most recent official signal of mainstream practice: adapt by default, the viewport cap off by default.

Options:

- **A. Product media ratio:**
    - Add `adapt` (follow the image) as the default.
    - Keep 3:4 and 1:1, and add landscape if cheap.
    - When `adapt` meets the viewport cap, use `contain` so nothing is cropped (Dawn's default).
    - Addresses the checklist ratios and screenshot 4. About 3 h. Tier Ask (Liquid, schema, locale).
- **B. Stage-type sections (`routine-showcase` first):**
    - Cap the media height in svh (Horizon uses 80svh), so the arch no longer reaches 969px on a 1307px screen.
    - Add a content position (top, middle, space-between).
    - Addresses screenshot 1. About 2 h for `routine-showcase`; other stage sections are audited in the same pass. Tier Ask.
- **C. A shared height and position contract in `snippets/section-frame.liquid` for every media-led section:** larger (about 5 to 6 h). It belongs to the polish pass.

Leaning: A and B as one layout batch before submission (A carries review risk), C stays in the polish pass. Dependency: verifying A needs product images at 16:9, 4:3 and 1:1. Either the user uploads test products (merchant content), or the agent injects rendered markup with substituted images through the Section Rendering API in DevTools, without writing files.

Earlier topics closed. BP1 (sorting the consolidated browser pass) moved into plan BP1 in `docs/agent/context.md` with option 1, 2026-10-27; its moves and drops are recorded in `docs/agent/backlog.md` group 7. OS1 (optional sections, review risk) moved into plan OS1 in `docs/agent/context.md` with option A, 2026-10-27; its design items went to `docs/agent/backlog.md` group 6. PS1 (product info load shift) moved into plan PS1 in `docs/agent/context.md` with option A, 2026-10-27. PB1 (`promo-bannder` panel schemes) moved into plan PB1 in `docs/agent/context.md` with option C, 2026-10-27. Performance classification (backlog group 1) moved into plan L1 in `docs/agent/context.md` with scope A, 2026-10-26; its classification evidence is in the plan. CSS organisation (who owns spacing) moved into `docs/project.md` Accepted Direction as Spacing ownership, without primitives or lint, 2026-10-26. Content spacing (heading to action) moved into the B10 plan, 2026-10-25. The two `ritual-steps` style B topics moved into the B9 plan, 2026-10-25. B7 (`feature-tabs` markers) moved into the plan in `docs/agent/context.md`, 2026-10-25. (Packshot images decided 2026-10-23 and fixed in B6, `73aa65d`. Closed 2026-10-23 with no change, judged against official best practice: Stop hook scope, since the whole-worktree scan is the documented practice and parallel writers use separate worktrees; `mixed-element`, since B4's final commit displaced no CSS, the `:where(.own-class)` route exists, and the ban matches the unlayered section stylesheets; the `AGENTS.md` pass, see Deferred ideas. Evidence: git history of this file.)

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
