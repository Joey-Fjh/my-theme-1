# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-28.

## Plan OS2: optional sections design pass and the newsletter height cap

**Outcome.** The optional sections show nothing that conflicts with `docs/design/design.md`: no drop shadows on page content, 1px hairlines, the radius token, a scrim behind text over photographs, consistent link styles, and no HTML comments in the output. The `newsletter-banner` can no longer grow taller than the screen because of a portrait image.

**Decided (user, 2026-10-28).** Board topic OS2, option B: the review-facing items plus the newsletter height cap, CSS only, no new setting. The countdown px digit sizes stay with the migration ratchet after submission (`docs/agent/backlog.md` After submission). Takes both lines of backlog group 6.

**Evidence.** From board topic OS2 (2026-10-28): the `video-banner` play icon carries `--shadow-md` (hover `--shadow-lg`, scale 1.08 not limited to pointer devices, literal focus outline); `media-video` play `shadow-md` and mute `shadow-sm`; `before-after-comparison` labels `border-2` with only `backdrop-blur-sm` over the photo, frames `rounded-lg`; `newsletter-banner` text over the image without a scrim, alt falling back to the heading, height from the image ratio (9/16 mobile, about 690px at 390; the image's own ratio on desktop, uncapped); `promotion-countdown` link `variant: 'underline'` and four `<!-- -->` comments. Usage: `newsletter-banner` in `templates/article.json`, `templates/blog.json` and `templates/page.about.json`; `before-after-comparison` in `templates/page.about.json`; `video-banner` and `promotion-countdown` are in no template, so their check adds them to the development theme in the theme editor without `--theme-editor-sync` (no merchant file changes). Alt source: Shopify's image guidance, "for decorative images that don't add information, use an empty alt attribute" (Shopify Dev MCP, 2026-10-28).

**Implementation surface and method.**

1. **`sections/video-banner.liquid`** (`{% stylesheet %}`): the play icon loses `box-shadow` (rest and hover); the hover scale sits under `@media (hover: hover)`, uses the existing motion tokens and stops under `prefers-reduced-motion: reduce` and `motion_enabled` off per the motion reference; the focus ring uses the shared `focus-ring` utility or its tokens instead of the literal `2px` / `3px`.
2. **`snippets/media-video.liquid`**: the play and mute buttons lose `shadow-md` / `shadow-sm`; legibility over video comes from the existing `bg-veil` surface (raised to a scrim token only if contrast fails, measured).
3. **`sections/before-after-comparison.liquid`**: the four labels move to a scrim chip (`--color-scrim` fill, `--color-on-scrim` text, no 2px border; a 1px hairline only if the design needs one); the three frames use the card radius token instead of `rounded-lg`. The image alt fallback to the label stays (the images are the content).
4. **`sections/newsletter-banner.liquid`**:
    - When a background image is set, a scrim layer sits between the image and the content, and the content takes the on-scrim colours (`design.md`: scrims are black at fixed opacities with white text, independent of the scheme); without an image the scheme colours stay. The form field and button keep 3:1 non-text and 4.5:1 text contrast on the scrim.
    - The background alt is `''` when the merchant left the image alt empty (no heading fallback).
    - Height: the media box keeps its ratio but is capped at `80svh` (as in LS1), with the image filling it per `background_image_fit`; the cap never clips the content (the box grows when the content is taller).
5. **`sections/promotion-countdown.liquid`**: the call to action uses the link `default` variant (resting underline) like the other arrow links; the four HTML comments become Liquid comments or are removed.
6. `assets/tailwind.output.css` only through `npm.cmd run build:tw` when utility classes change.

Read `docs/references/style-system/css-architecture.md` before the CSS changes and `docs/references/architecture/motion-architecture.md` before item 1. Item 1 changes motion, so `review-animations` runs on the motion diff and its output is recorded below.

**Review tier.** Ask: Liquid markup changes in sections and a snippet. The Verifier runs in a separate session from `.agents/roles/verifier.md`.

**Estimate:** about 3 hours (items 1 and 2 0.5, item 3 0.5, item 4 1.25, item 5 0.25, validators and records 0.5), plus the Ask review.

**Checkpoint:** two stops.

- After items 1 to 6 and the validators: report the diff, validator output and the contrast numbers, then the Ask review prompt.
- Whenever a fix needs a file, setting, locale key or method not named above (for example a new schema setting for the scrim or the height).

**Bar:** judged on the default settings, the current templates and their demo content, at 1440×900 and 390×844.

- **Must fix:**
    - Any `box-shadow` or `shadow-*` left on the play, mute or label elements of these sections.
    - Any text over a photograph in these sections without a scrim, or below 4.5:1 (text) or 3:1 (field and button borders) against it.
    - A `newsletter-banner` taller than 80svh because of its image, or its content clipped by the cap.
    - Any HTML comment from `promotion-countdown` in the rendered page.
    - Any validator failure, any new `test:layout` issue, any focus or keyboard regression on the play button, comparison slider or newsletter form.
- **Accepted residue:** the countdown px digit sizes (ratchet after submission); hover scale on the play icon on pointer devices.

**Acceptance checks.**

1. `grep` on the five files shows no `shadow` in the play, mute and label rules.
2. Comparison labels at 1440 and 390 (`/pages/about`): chip with scrim, no 2px border, frames on the radius token; contrast measured and recorded.
3. `newsletter-banner` on `/pages/about` and a blog page, at 1440×900 and 390×844: height before and after, scrim present, text and field contrast recorded; the image alt is empty when the merchant alt is empty (DOM check).
4. `video-banner` and `promotion-countdown` added in the theme editor on the development theme: play icon flat, hover only with a pointer, focus ring visible by keyboard; the call to action underlined at rest; view source shows no `<!-- Days -->` comments.
5. `review-animations` output on the item 1 motion diff, recorded below.
6. Validators: `npm.cmd run lint:theme`, `npm.cmd run test:theme-check`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run lint:i18n`, `npm.cmd run scan:compat` (stylesheet changes), `npm.cmd run test:layout -- --widths 390,768,1024,1440` with 0 new issues, Prettier on every changed file.
7. The Ask review reports PASS; the user looks at `/pages/about`, a blog page and the two editor-added sections at 1440 and on their phone.

**History.** Planned 2026-10-28 from board topic OS2 (option B). Authorized by the user 2026-10-28; implemented by the coordinator.

**Results.**

Implementation, 2026-10-28 (coordinator):

1. `video-banner`: play icon shadow removed (rest and hover, and `box-shadow` out of the transition); the 1.08 hover scale sits under `(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)`; the focus ring uses `--focus-ring-width`, `--focus-ring-opacity` and `--focus-ring-offset` like the `focus-ring` utility (drawn on the icon, because the button covers the whole frame).
2. `media-video`: `shadow-md` and `shadow-sm` removed from the play and mute buttons; `bg-veil` and the blur stay.
3. `before-after-comparison`: labels `rounded bg-scrim … text-on-scrim`, no border or blur; frames on a new `.before-after__frame` (`position: relative`, `overflow: hidden`, `border-radius: var(--radius-card)`). The desktop slider keeps its utilities (`relative cursor-ew-resize touch-pan-y select-none`) inside a new `.before-after__frame` wrapper, because `mixed-element` forbids an own class beside core utilities and `lint:compat` rejects `touch-action` in a stylesheet.
4. `newsletter-banner`: with a background image, a `bg-scrim` layer after the blur overlay and `.newsletter-banner__media--scrim`, which sets `--color-on-scrim` on the copy (`[data-newsletter-content] > :first-child`, the heading and subtitle) and the success status; the error message keeps `text-error-text`, and the field and button keep their own scheme fills. The selectors use `data-*` attributes because naming the utility-bearing content and status classes trips `mixed-element`. Alt is the merchant alt or `''`. Height: `max-height: 80svh` with `min-height: min-content` (min wins over max, so taller content grows the box), at all widths (9/16 at 390 is about 690px against 80svh of 675px at 844).
5. `promotion-countdown`: the five `<!-- -->` comments are now `{% comment %}`; the call to action is `variant: 'default'` plus `link-with-icon-motion`, matching the other arrow links (`featured-products`, `mood-finder`).
6. `assets/tailwind.output.css` rebuilt with `npm.cmd run build:tw`.

**Corrections to the plan:**
- **Item 1:** the hover scale does not follow `motion_enabled`. The Theme-Specific Contracts in `docs/project.md` say the switch is not a kill switch for hover, so the hover follows `prefers-reduced-motion` only.
- **Item 3:** the slider wrapper (above) is a structural change the plan did not spell out; behaviour (pointer events, clip and handle) is unchanged.
- **Tooling slip:** `snippets/media-video.liquid` was edited once with `sed -i` (dev server not running at the time, checked afterwards).

`review-animations` (item 1 diff): passes `STANDARDS.md`. Hover scale gated to fine pointers ("touch fires false hovers on tap"), transform only, motion tokens for duration and ease, removed under reduced motion; 1.08 is a frequent-use hover, but on a single large play target, so it is kept.

Validators: `lint:theme` passed; `test:theme-check` 158 files, no offenses; `lint:liquid-syntax` passed; `lint:i18n` passed (no new keys); `lint:compat` / `scan:compat` passed (67 stylesheet blocks); Prettier run on the five files (it does not re-indent markup inside `capture`, so the slider wrapper was indented by hand); `lint:records` passed.

**Ask review 1 (separate session, 2026-10-28): PASS**, no batch defects.
- **Proven:**
    - The diff stays inside the surface. No shadows remain on the play, mute or label elements.
    - The hover gate is correct, and leaving out `motion_enabled` agrees with `docs/project.md`. `review-animations`: Approve.
    - The comparison labels are on the scrim, and the frames compute to the 16px card radius.
    - Slider keyboard: ArrowRight 50 to 55, with the clip and the handle in step. Synthetic pointer drag to 75%.
    - Mobile stacked at about 358×201.
    - Newsletter height at 1440×900: 774.56px without the cap, 720px with it (content 162px). At 390×844: 636px, cap not reached. Content never clipped.
    - Field border 4.75:1 on its fill; button text 11.78:1.
    - The countdown has no HTML comments; the call to action is `links-default` with `link-with-icon-motion`.
    - All validators passed and `test:layout` reported 0 new issues.
- **Unproven:**
    - `/pages/about` is a 404; the review used `/pages/privacy-policy?view=about`.
    - The demo fixtures render placeholders, not photographs, so the scrim contrast over a photograph and the empty-alt and label-alt DOM checks are unproven.
    - Newsletter success and error states: no form was submitted.
    - `video-banner` and `promotion-countdown` were not on any page.
    - Physical touch drag.
- **Note (pre-existing):** `sections/before-after-comparison.liquid` slider handle `focus:outline-none` computes keyboard focus to `outline-style: none` over `focus-ring`. Present before this batch, so not a regression.
- **Review process:** the reviewer ran `scan:compat`, which invokes `build:tw`. The working tree afterwards held the same nine files.

**Correction 1 (user chose A, 2026-10-28):** removed `focus:outline-none` from the slider handle in `sections/before-after-comparison.liquid`, so the `focus-ring` utility draws on `:focus-visible`. Re-run: `build:tw`; `lint:theme`, `test:theme-check`, `lint:liquid-syntax`, `lint:compat` passed; Prettier clean; `test:layout` 0 new issues.

**Correction review (separate session, 2026-10-28): PASS.** Only the class changed (restoring it reproduces review 1's blob). Tab focus gives a solid 2px outline with a 2px offset from `.focus-ring:focus-visible`; a fresh mouse click shows no ring. Arrow keys, hover scale 1.1 and the DevTools drag to about 95% all work. The mobile frames stay stacked (about 358×201, 16px radius). Validators pass and `test:layout` reports 0 new issues. Still unproven: physical touch drag.

**User browser acceptance (step 8): accepted, 2026-10-28.**

**Open:**
- `test:layout -- --widths 390,768,1024,1440`: done 2026-10-28, 0 new issues (home tap-targets 5 and clipped-text 1, `collection-all` page-margin 1, `not-found` page-margin 3, all in the baseline).
- Contrast numbers on the scrims (acceptance checks 2 and 3): these are runtime checks for the Ask review. With the default `--color-scrim` (black at 50%), white text stays at 4.5:1 or better only where the image under it is darker than about mid-grey; over a white area it reaches about 4:1. The bar judges the demo content.
