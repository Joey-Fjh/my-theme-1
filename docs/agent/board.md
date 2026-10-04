# Work Board

This board holds only what is not yet decided: the one active decision, evidence that has not become a plan, and deferred ideas. `docs/agent/context.md` holds exactly one accepted plan during execution, or no plan. Recording a plan does not authorize implementation. Project identity, scope, accepted direction, and overall status belong in `docs/project.md`; completed execution history belongs in Git.

Last updated: 2026-10-04.

## Open decisions

None active. Next (user, 2026-10-04): the design rework, then one browser pass, then the docs review together with a readiness review before the second submission.

**Accepted direction, first design-phase batch (user, 2026-10-04): motion simplification.** Not yet a plan.

- Remove the media reveal (zoom, slide, fade on images and video) and the per-element text reveal (49 `data-motion-reveal="content"` and 16 `"media"` targets today).
- Keep one ordinary reveal: list and card items appearing in sequence (stagger).
- Theme settings: keep `motion_enabled` (same ID, so `settings_data.json` stays valid; the label may change) as the one switch; remove `content_reveal_style`, `media_reveal_style`, `motion_speed`, `reveal_behavior`. This changes the "Merchant motion settings" contract in `docs/project.md` (approved by the user with this direction).
- `motion_enabled` off turns off the list reveal and any future GSAP choreography (the final static state shows); hover, focus, dropdown, drawer, dialog and loading feedback stay, under `prefers-reduced-motion`. A GSAP section may add its own section setting later; the global switch wins.
- Reasons: `assets/motion-reveal.js` is 53,915 bytes raw for ordinary reveals; media reveal touches LCP and CLS candidates; distinctiveness should come from the home page choreography, not from global reveal options.
- GSAP is not vendored in this batch: it arrives with its first consumer, the home page narrative (`AGENTS.md`, vendored libraries).

Design phase inputs:

- Component CSS: the shared rules in `tailwind/tailwind.components.css` (product info blocks, quick view, marquee) are reworked in the design phase (user, 2026-10-03).
- Design phase: font faces. The theme loads the base weight and bold only, so `font-medium` renders with the 400 face and `font-semibold` with the 700 face. Load more weights if the design needs them.
- Design phase: overlay colour. The `dialog-overlay` token is black at 45%, while markup also uses `bg-black/45`, `/60` and `/80` scrims. Decide whether scrims share the token.
- Design phase: article's `padding_top` setting has had no effect since before the frame (the hero carries no section padding and the body block was `layout-no-pt`); 5-C3d3 kept that. Decide with the design rework whether it should apply.
- Design phase (user, 2026-10-03): only hero-type sections such as the home slideshow are expected to fill the screen; whether other sections keep a set distance from a full screen is decided with the home page redesign. 5-C3c keeps today's heights, identical or close.

## Evidence

- Browser pass status (2026-10-04). Three agent sessions (reports outside the repo: `C:\Users\Joey\AppData\Local\Temp\ceylune-phase5-cutoff-report.md`, `-report-part2.md`, `-report-part3.md`) found two regressions, both fixed: the home slideshow stage size (5-B1, `9c4dd05`) and, pre-existing on the live theme, the dialog close labels and the initial variant selection (5-B2, `6bfdc7c`). No open regression on dev. A suspected cart drawer Escape failure was a misread of the always-present `.cart-overlay-section` shell. The dev-only GraphQL 400 and `shop.app` 403 come from the `127.0.0.1` origin (absent through `?preview_theme_id=`). Still open: live side by side (the agent sessions stayed on the password form), no-JavaScript at 1440, most of G3 and G5, the 5-C3f keyboard focus sweep, the width matrix, product media Escape, reduced motion (the MCP cannot emulate it), facet history, stylesheet subsetting on a pushed theme (5-C1), and the rows Blocked for data, Theme Editor, Safari or configuration variants. Per-batch check lists from the closed batches: `git show fe4b986:docs/agent/board.md` (Evidence, "Consolidated browser pass"). Remaining rows: `docs/migration/phase0/browser-checklist.md`, deleted after the pass.
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

## Deferred ideas

- Design phase, home page scroll narrative (user, 2026-09-30): the user expects GSAP (ScrollTrigger) to be required and possibly Three.js. Compatible with H: a section module (`data-module-id`, typically `data-module-lazy`) loads the library inside its component through an adapter, as `carousel-swiper.js` does for Swiper; H only guarantees the component definition. Constraints from existing rules: the motion reference must classify the work as complex choreography before GSAP; first frame rendered in Liquid and visible without JS; `prefers-reduced-motion` and `motion_enabled` honoured; a Three.js canvas must not be the LCP element (poster image first) and should initialize when visible and idle; vendoring follows `THIRD_PARTY_NOTICES.md`. Full-page loading of these libraries would weigh on every page and on the Lighthouse bar, so on-demand loading is required for them. Loader choice (user question, coordinator answer 2026-09-30): own implementation (H) over Async Alpine, which would change every module; revisit if loading strategies grow beyond eager, visible, idle, or if `interceptInit` changes in an Alpine upgrade.

- CSS craft (user, 2026-09-29): architecture is considered sound, but CSS implementation lacks detail. Coordinator view: the gap is a missing design specification (direction, type scale, spacing rhythm, state rules). `frontend-design` is vendored as a design reference below the project rules (`AGENTS.md`, Agent Skills); the Vercel Web Interface Guidelines were not evaluated. The design phase writes that specification.

- Design phase: the DesignSync tool (user-started `/design-sync`) syncs a local component library with a claude.ai/design design-system project (token and component preview cards). It does not build CSS; it could host the token and key-component previews while iterating on the visual direction the Theme Store review asked for.
