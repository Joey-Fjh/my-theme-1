---
version: alpha
name: Ceylune
# Default preset palette (the "Ceylune" preset). Merchants edit these through colour schemes; code never reads them from here.
colors:
    ink: '#263d29'
    accent: '#d5ff83'
    canvas: '#f1f1f1'
    sage: '#e3e8da'
    surface: '#ffffff'
    rating: '#ffdb3c'
---

# Ceylune Design Language

Status: complete draft, agreed by the user section by section (2026-10-11). Values are provisional and tuned at the browser look; the roles and rules are what this document fixes.
Visual reference: the home design (`docs/design/home/`), read for look, arrangement and hierarchy, never for values.
Pattern references: `docs/design/references/` (Isla Beauty, Beautiful, ARTU), read for character, never for values.

## Overview

**A calm, natural shelf.** Ceylune presents products the way a quiet skincare counter does: soft light backgrounds, a deep natural green for type and action, generous space, and photography of real materials (frosted glass, wood, clay, leaves, skin) carrying the mood. The interface stays out of the way; the products and their images are the subject.

**A theme before a brand.** Ceylune is a multi-industry Theme Store theme. The skincare look is its default preset, not its limit: merchants change colours through colour schemes and fonts through the font picker. The language therefore lives in structure that survives those changes: hierarchy, spacing, proportion, shape and restraint. A Ceylune store in another palette and typeface must still read as Ceylune.

**Character, in five rules:**

1. **Big, tight headings; quiet text.** Hierarchy comes from a large jump in size between headings and body, not from many weights or decoration. Headings are set large, tight and close to the content they introduce; body text is plain and comfortable.
2. **One accent, used sparingly.** The default palette is a light canvas, one dark ink colour (deep green), and one bright accent for small moments (announcement bar, a highlight, a badge). The accent never fills large areas or carries body text. Functional colours (rating stars, sale, error, success) are not accents: each keeps to its one job.
3. **Flat, with depth from surfaces.** No drop shadows for elevation. Depth comes from a few surface steps (canvas, card, inverted dark panel) and 1px hairlines. **One exception, a deliberate 3D moment:** an interactive media card may tilt on hover or selection over a soft, tinted backdrop shadow (a colour of the palette behind the card, not a grey drop shadow), as in the home design's category cards.
4. **Soft shapes, one family.** Cards and media share a small set of moderate radii; controls follow their own consistent shape. No mix of sharp and pill shapes on the same kind of element.
5. **Space is the separator.** Sections are separated by generous vertical space and background changes, not by rules and boxes. Content stays inside the page margins; only backgrounds and full-bleed media reach the edges.

**Tone:** calm, natural, premium without luxury clichés (no gold, no script fonts, no heavy gradients). Motion is gentle and purposeful: content eases in, carousels move on request, nothing competes with the products.

**Not Ceylune:** dense promotional grids, multiple competing accent colours, shadows and glows, decorative illustration standing in for photography, text set over busy images without a scrim.

## Colors

**Roles, not swatches.** Code never names a colour value. Every colour comes from a role of the active colour scheme (`tailwind/tailwind.input.css` maps scheme settings to role tokens; the colour lints enforce it), so a merchant's palette change reaches every section. This document fixes the roles, how many schemes exist and what each is for, and the default preset values; the values themselves live in the preset and belong to the merchant once installed.

**Default palette (the Ceylune preset).** The values are a starting point, tuned after the browser look; the roles and rules are what this section fixes.

| Name | Value | Role |
| --- | --- | --- |
| Ink | `#263d29` | Text, headings, borders and primary buttons on every light scheme, and the background of the inverse scheme. The one dark colour (the preset's second dark, `#1b2900`, is merged into it). |
| Accent | `#d5ff83` | The one bright accent: the marquee strip, small highlights, text on the inverse scheme. Never text on a light background (1.14:1 on white). |
| Canvas | `#f1f1f1` | Default page background. |
| Sage | `#e3e8da` | Alternate light section background, for rhythm between sections. |
| Surface | `#ffffff` | Cards, inputs, media plates; one step above canvas and sage. |
| Rating | `#ffdb3c` | Rating stars only (functional, not an accent). |

**Derived colours.** Muted text, lines, subtle surfaces and indicators are the scheme's ink or background at fixed opacities (`--color-muted`, `--color-line`, `--color-surface-muted` and their siblings), never a separate grey. Greys are therefore always tinted by the ink, as the design's green-greys are. Scrims over media are black at fixed opacities with white text, independent of the scheme.

**Schemes (five, each with one job):**

| Scheme | Background / text | Use |
| --- | --- | --- |
| `scheme-1` Inverse | ink / accent | Site chrome and dark bands: announcement bar, header, footer, hero slideshow, statement sections. |
| `scheme-2` Canvas | canvas / ink | The default for page sections. |
| `scheme-3` Accent | accent / ink | Thin promotional bands only (the scrolling marquee strip); never a full content section. |
| `scheme-4` Sage | sage / ink | Alternating light sections. |
| `scheme-5` Surface | surface / ink | Plain white sections and card-like blocks. |

**Contrast (WCAG 2.2 AA, every scheme):** body text at least 4.5:1, large text (24px, or 18.66px bold) at least 3:1, controls, focus rings and informative graphics at least 3:1. The default pairs pass with margin (ink on canvas 10.4:1, on sage 9.4:1, on white 11.8:1, accent on ink 10.4:1, white on ink 11.8:1). Checked weak spots: `--color-subtle` (ink at 72%) on sage is 4.45:1, below 4.5, so it is for large text and non-essential decoration only; rating stars are below 3:1 on every light background, so the rating is always also given as text (the count and an accessible label), never by star colour alone.

**Functional colours.** Success, warning, error and info pairs, and product badges (sale, sold out, custom), each keep to their own job and never act as accents.

**Gaps found (fixed in 6-D1 and 6-D2, 2026-10-11):**

- The colour scheme defaults in `config/settings_schema.json` are the mother template's blue (`#1D4ED8`), so a scheme a merchant adds starts off-palette. Fixed in 6-D1: they default to the Ceylune canvas scheme.
- Product badge defaults are off-palette: sale orange `#C2410C`, sold-out slate `#64748B`, custom brown `#8B5A3C`. Fixed in 6-D1 (sale accent on ink, sold out `#677769`, custom 2 sage).
- The inverse scheme background moves from `#1b2900` to ink `#263d29` (preset change, approved 2026-10-11). Fixed in 6-D2, with every other dark in the schemes (`#1f3223`, `#111827`) and the inverse buttons on white and ink.
- Input borders and placeholders are neutral greys (`#767676`, `#717171`) in every scheme, not ink-tinted. Fixed: `#677769` (ink at 70%) with ink input text, schema defaults in 6-D1 and every preset scheme in 6-D2.

## Typography

**One family, few weights.** The default preset uses one sans family for headings, body and labels; hierarchy comes from size, not from mixing families. Weights: 400 for body, 500 for headings and labels, 400 italic for quotes. The home design's stray families (Manrope labels, Roboto Mono, Poppins) are not carried over: labels use the body family.

**Default family: Instrument Sans** (`instrument_sans_n4`, Shopify font library, open source). The design's Neue Montreal is commercial and not in the library. Neue Haas Unica was agreed first (2026-10-11), but it is on the library's deprecated list with Instrument Sans as its replacement, and Shopify already serves Instrument Sans for it; Theme Store presets may not use deprecated fonts, so the preset names Instrument Sans directly (6-D2). Plain, slightly warm grotesque with 400, 500 and 700 and italics. Merchants change it through the font pickers.

**Scale.** The fluid scale already in code (6-C8): body base 14px at 375 and 16px at 1280 and above, ratio 1.2 rising to 1.25, steps `-2..8`; headings use the `title-*` tiers, text the `copy-*` tiers, and merchants scale both through `heading_scale` and `body_scale`. The design's sizes are read as hierarchy only: a very large hero heading (`title-4xl`, about 60px on mobile to 95px on desktop), section headings two to three steps below it, then body. No size outside the scale.

| Tier | Use |
| --- | --- |
| `title-4xl`, `title-3xl` | Hero and statement headings; one per viewport. |
| `title-2xl`, `title-xl` | Section headings. |
| `title-l`, `title-m` | Card and block headings, product title. |
| `title-s`, `title-xs` | Small headings, labels with heading weight. |
| `copy-xl`, `copy-l` | Lead paragraphs, testimonial quotes. |
| `copy-m` | Body text, the default. |
| `copy-s` | Captions, meta, helper text; never below 12px rendered. |

**Headings: large, tight, close.** Large headings sit on a tight line height (about 1.0) with slightly negative tracking (-0.02em), and close to the text they introduce. Small headings need more line height (about 1.2) to stay readable over two lines, so line height steps with size rather than being one value for every tier. Headings keep sentence or title case as written; uppercase is a section-level choice, not a default.

**Body: plain and comfortable.** Line height about 1.4 to 1.5, no tracking, measure 45–75 characters for paragraphs.

**Labels (subtitle role).** Small text above a heading or on a control: body family, weight 500, `copy-s`, title case, slight positive tracking. Not uppercase by default.

**Default settings this implies:** **6-D1 (schema defaults and code, shipped):** heading weight 500, heading letter spacing -0.02em, body line height 1.4, subtitle weight 500 with a medium (500) option, heading line height default 1.0 with stepped tiers in code (`title-xl` and up use the setting; smaller tiers use `max()` floors). **6-D2 (merchant preset, shipped):** both font pickers `instrument_sans_n4`.

## Layout

**Wide page, small margins.** Content runs almost edge to edge: in the home design every section's content spans the 1440 frame minus a small side margin (about 24px), not a narrow centred column. The page grid (6-C5: `--page-grid-columns` with `full` and `content` lines, `page_width` and `page_margin` settings) already expresses this; the wide page width (1600px, in the preset and as the schema default) means the margin, not the max width, frames the content on common laptop and desktop screens. Very wide screens (2560) still cap the content width so lines and grids do not stretch.

**A screen-sized rhythm, not a rule.** Most home sections are about one desktop viewport tall (about 900px at 1440): a statement, a product, a gallery, a set of steps. That is the home page's usual rhythm, chosen per section, not enforced: a section may run taller than a screen, and listing pages (collection, search, blog) flow continuously. Where a section is meant to fill the screen, `section-frame` height `stage` (or `stage-pc`, content-sized on mobile) does it.

**Spacing scale.** The fluid space scale already in code (6-C7: `--spacing-step-3xs` to `--spacing-step-4xl`, about 6px at 375 to 10px at 1280 per step unit), used through its four intents:

| Intent | Token | Use |
| --- | --- | --- |
| Tight | `--spacing-tight` | Inside a unit: label and value, icon and text. |
| Related | `--spacing-related` | Between parts of one block: heading and its text, text and its button. |
| Group | `--spacing-group` | Between blocks of one section: cards in a grid, columns. |
| Section | `--spacing-section` | Between sections and around their content. |

Every gap picks an intent first and a step second; the design's pixel distances are read only as which intent applies. Headings sit at the related distance from their text, never at group distance (rule 1 of the Overview).

**Composition patterns** seen in the design and kept:

- Split: media on one half, copy on the other, copy vertically centred (product spotlight, ingredient panels). Alternate sides between consecutive splits.
- Centred statement: one short paragraph or heading centred over a scattered or full-bleed image field.
- Rail: a horizontal row of cards that scrolls, with arrow controls aligned to the content edge. On mobile, rails show one card at a time, centred with side spacing; the rails that change are named at the polish pass.
- Grid: equal cards in 3 to 5 columns on desktop, 2 or 1 on mobile.

**Alignment.** Section headings align to the content edge (left) or centre, chosen per section and kept consistent within it; body copy is left-aligned except in centred statements of three lines or fewer.

**Default settings this implies:** **6-D1 (schema defaults and code, shipped):** page width schema default 1600px; page margin schema default 24px with a fluid `--page-margin` clamp (about 16px at 375px rising to the setting at 1280px; when the setting is below 16px the margin stays constant). **6-D2 (merchant preset, shipped):** `page_width` 1600, `page_margin` 24 (16px at 375, 24px from 1280).

**Every width works (user, 2026-10-11).** The wide page and fluid margin must hold at every width from 320 to 2560, not only at the four design widths: no horizontal scroll, no content outside the margins, no overlapping or clipped text. `npm.cmd run test:layout` checks 320 to 2560 in 40px steps and is the gate for each layout batch; the browser look covers 375, 768, 1024, 1440 and one ultra-wide screen.

**Breakpoints.** Tailwind breakpoints `tablet` (768), `desktop` (1024), `wide` (1280); the design is checked at 375, 768, 1024 and 1440 (see Responsive).

## Elevation & Depth

**Page content is flat.** Sections, cards, buttons and inputs carry no drop shadow. Depth on the page comes from three things only: the surface steps of the palette (canvas or sage, then white surface, then the inverse ink panel), 1px hairlines in the line colours, and photography.

**The 3D moment (Overview rule 3).** An interactive media card may tilt slightly on hover or selection over a backdrop: a blurred shape in a palette colour placed behind the card, the way the home design's category rail does it (a blurred rectangle behind the active card), never a grey offset shadow. It is motion-safe (no tilt under reduced motion; the backdrop alone may stay) and used on one rail or grid per page at most.

**Overlays float.** Drawers, dialogs, popovers and toasts are the only elements that sit above the page, and they show it: a scrim behind modal layers (`--color-scrim`), and one soft shadow on the panel itself so it separates from what it covers. Their stacking follows the `--z-layer-*` scale in `tailwind/tailwind.input.css`.

**Default settings this implies:** **6-D1:** unchanged from prior schema (button, input and product card shadow opacity 0; dialog and toast soft shadow 10% / 24px and 16px blur). **6-D2:** no shadow changes planned in preset batch.

## Shapes

**Soft, in three sizes.** Radii follow the size of the thing, so small controls look crisp and large surfaces look soft:

| Size | Radius (default) | Elements |
| --- | --- | --- |
| Small | about 4px | Buttons, inputs, variant and size options, quantity selector, badges. |
| Medium | about 8px | Thumbnails, small media, popovers, toasts. |
| Large | about 16px | Feature cards (category, testimonial, gallery), contained editorial media, dialogs, inset panels. |
| Square | 0 | Commerce tiles: product cards and article cards, with their images. |
| Round | full | Pagination dots, swatches, icon-only round buttons, avatars. |

Full-bleed media (a section background, a split panel's image half) has no radius: it meets the screen edge or the panel edge square.

**One shape per kind of element.** All buttons share one radius; feature cards share one radius and commerce tiles another (agreed 2026-10-11: the design keeps product and article cards square, like shelf tiles, and rounds the editorial cards); a merchant changing the button radius changes every button. Pills (full radius) are not used for text buttons in the default preset.

**Lines.** Hairlines are 1px. Outlined controls (secondary buttons, variant options, inputs) use a 1px border in the ink or line colour; the selected state thickens the border colour, not its width. Focus rings are separate from borders (`focus_ring_width`, 2px default) and always visible on keyboard focus.

**Signature shape (optional):** the home design's routine showcase frames its image in a tall capsule (full radius on a 386 x 680 frame), with the product breaking out of the frame at the bottom. It is a section-level option, not a theme-wide shape.

**Default settings this implies:** **6-D1 (schema defaults and code, shipped):** button radius 4px, input radius 4px, product card radius 0, dialog radius 16px, toast radius 8px (unchanged); new `card_radius` default 16px with `--radius-card` and `--radius-media` (half) on feature cards in scroll-categories, testimonial-featured, and scatter-gallery. **6-D2 (merchant preset, shipped):** colour schemes on the palette (see Colors, Gaps found).

## Components

Each component is described by its role and look; sizes, gaps and radii come from the scales above. States (hover, focus, selected, disabled, loading, error, empty) are collected in Component States.

**Buttons and links.**

- Primary button: filled ink, white label, small radius, full width in cards and product forms. One per group.
- Secondary button: transparent fill, 1px ink border, ink label; sits beside or below a primary (Quick view, Buy it now).
- Arrow link (signature call to action; rule agreed 2026-10-11): text plus a thin right arrow, with a 1px underline running the full width of the text and arrow; uppercase in heroes and section calls to action (Shop the collection, Discover the ritual), sentence case in cards (Read more). It is the default call to action in editorial sections; filled buttons are for commerce actions (add to cart, buy, submit).
- Icon buttons (search, cart, account, carousel arrows): bare thin-stroke icons, no container, with at least a 24px target and a visible focus ring.

**Product card.** White surface on the section background, content inset: vendor or type label and image dots on top, badge at the image's top right, product image centred on white, title and price on one line at the bottom. Quick view and Add to cart appear on hover (desktop) over the lower image area; on touch they are reached through the card link or a visible button, never hover only.

**Feature card** (category rail, gallery). Large radius, white or image fill, title at the bottom in heading type; the image may fill the card (title in white over a scrim) or sit centred on white (title in ink). The active or hovered card gets the 3D moment.

**Testimonial card.** Split card: image half and quote half; the quote in italic body at lead size, stars and author below. Alternates surface (white) and inverse (ink panel, accent quote) in the same rail.

**Badges.** Small label in uppercase small type on a filled small-radius chip, at the image corner: best seller, new, sale (with percentage), sold out. Each badge type keeps one colour from the palette or its functional colour.

**Section header patterns.**

- Heading with count: a large heading with its item count in small type at the top right, e.g. New Arrivals (05).
- Heading tabs: two or three large headings in a row acting as tabs (Add on, New arrivals, Best sellers); the active one in ink, the others in faint ink. They are real tabs (tablist, keyboard arrows), not styled links.
- Eyebrow plus heading: a small label above a large heading (subtitle role).

**Numbered list.** Large rows of index number and name (01 Cleanser), the active row in ink and the rest in faint ink, paired with an image that follows the active row.

**Carousel controls.** Thin arrows aligned to the content edge; dots (round, active one elongated or filled); a fraction counter with short progress bars (01 / 03); a thumbnail strip with captions for product or routine slides. Every control is a button with an accessible name. Autoplay always has a way to pause (WCAG 2.2.2): with a mouse, hovering the active control and keyboard focus pause it and no pause button is shown; on devices that cannot hover (touch), a pause button appears beside the dots.

**Product form controls.** Variant options as outlined small-radius boxes (with a colour dot for swatch values), size options as smaller boxes, quantity as one outlined group with minus and plus icon buttons. Selected state: ink border and ink text; unavailable: faint text with a strike, still focusable.

**Inputs.** Two styles: boxed (forms, product page, cart) with a 1px border and small radius, and underlined (header search, newsletter) with a bottom hairline and a trailing arrow or icon button. Labels are always present (visible or accessible).

**Rating.** Five stars in the rating colour with empty stars in faint ink, followed by the count in body type; the value is also given as text for assistive technology.

**Site chrome.**

- Announcement bar: inverse scheme, one centred line with an arrow link.
- Header: logo at the left, main navigation beside it, underlined search field and icon buttons at the right; it sits over the hero on the home page.
- Marquee strip: accent scheme, one line of repeated text in body type with a separator glyph, moving slowly, paused under reduced motion.
- Footer: inverse scheme, link columns and a newsletter field above, a very large wordmark in accent below, a hairline and a bottom row (location, copyright, back to top).

**Not carried over from the design:** the monospace italic used for step labels, prices and slide numbers (Roboto Mono): step labels use the body family in uppercase small type on an ink-tinted chip, numbers use tabular figures of the body family.

## Do's and Don'ts

**Do**

- Build hierarchy with size: one very large heading per screen, a clear step down to section headings, plain body.
- Take every colour from a scheme role; let greys come from the ink at an opacity.
- Keep the accent small: a strip, a highlight, a badge, text on the inverse panel.
- Separate sections with space and background changes; keep content inside the page margins.
- Use the arrow link for editorial calls to action and filled buttons for commerce actions.
- Round feature cards and editorial media; keep product and article tiles square.
- Let photography carry the mood: real materials, natural light, products large.
- Check every change from 320 to 2560 wide (`test:layout`), and at 375, 768, 1024 and 1440 by eye.

**Don't**

- Don't add drop shadows to page content, or grey shadows anywhere; the only lifted elements are overlays and the 3D moment.
- Don't introduce a second accent, a second dark, or a neutral grey outside the derived roles.
- Don't set accent or rating colours as text on light backgrounds.
- Don't add a second type family for labels or numbers, or weights beyond 400, 500 and 400 italic in the default preset.
- Don't use sizes or gaps outside the type and space scales, even when a design shows one.
- Don't mix shapes within one kind of element (pill and box buttons, round and square product cards).
- Don't rely on hover alone for any action, or on colour alone for any state.
- Don't put text over a busy image without a scrim that keeps it at contrast.

## Component States

Every interactive component defines these states; a state not listed for a component does not apply to it.

| State | Treatment |
| --- | --- |
| Hover (pointer devices only) | A small, quick change: filled buttons lighten or darken one step, outlined controls take a faint surface fill, arrow links slide the arrow a few pixels, media zooms very slightly inside its frame, feature cards take the 3D moment. Never the only way to reach an action. |
| Focus visible | A focus ring of `focus_ring_width` (2px) in the scheme's focus colour, offset from the element, on every keyboard-focusable element; never removed, never only a colour change. |
| Active (pressed) | A brief press: a slight scale-down or darker fill; no layout shift. |
| Selected / current | Ink border or ink text against faint siblings (variant options, heading tabs, numbered list rows, thumbnails, dots); exposed with `aria-pressed`, `aria-selected` or `aria-current`. |
| Disabled | Faint ink text and border, no hover; still announced as disabled. Prefer explaining why (sold out, select a size) over disabling silently. |
| Unavailable option | Faint text with a strike; still focusable and selectable so the customer can see it is sold out. |
| Loading | The control keeps its size; its label is replaced or joined by a small spinner, and it is announced (`aria-busy` or a live region). Lists and grids show placeholders in the surface-muted colour at final size, not spinners. |
| Error | Error colour on the message and the field border, an icon or text with the message (not colour alone), message linked to the field (`aria-describedby`), focus moved to the first error on submit. |
| Success | Success colour with a short message in a live region (added to cart, subscribed). |
| Empty | A short sentence and one next step (empty cart: a link to continue shopping; no results: suggestions and a search field), in body type on the section background. |

## Responsive

The home design has two frames, 1440 and 375; the 375 frame is the desktop scaled to 60%, so it shows arrangement only, and there is no tablet frame. Behaviour at the four checked widths:

| Pattern | 375 (mobile) | 768 (tablet) | 1024 (small desktop) | 1440 (desktop) |
| --- | --- | --- | --- | --- |
| Header | Menu button, logo, search, cart and account icons | As mobile | Logo, inline navigation, search field, icons | As 1024 |
| Hero | Full screen, heading over the image at the top, call to action and intro text at the bottom | As mobile, heading larger | Heading left over the image | As 1024 |
| Split | Stacked: media first, copy below | Stacked, or side by side for short copy | Side by side | Side by side |
| Rail | One card at a time, centred, side spacing, swipe; arrows hidden or below | Two cards visible | Three to four cards, arrows at the content edge | Four to five cards |
| Product grid | Two columns | Two or three columns | Three or four columns | Four columns |
| Article grid | One column | Two columns | Three columns | Three columns |
| Numbered list | Stacked rows, each with its own image and call to action (an open list, not an accordion) | As mobile | Rows left, one image right following the active row | As 1024 |
| Scattered gallery | Fewer images, still scattered around the centred statement | As 1440, smaller | As 1440 | Scattered field |
| Icon row | Stacked, one item per row | Three in a row | Three in a row | Three in a row |
| Footer | Link columns in up to three columns, text and newsletter below, smaller wordmark | As mobile, wider | Columns and newsletter in one row, large wordmark | As 1024 |

Rules across widths:

- Type and space scale fluidly between 375 and 1280; the tiers do not change per breakpoint.
- Touch targets are at least 24px (44px for primary actions on mobile).
- Nothing that is hover-revealed on desktop is hidden on touch: product card actions become a visible button or the card link.
- Which rails switch to the one-centred-card behaviour is named by the user at the polish pass (three rails, not every rail).

## Motion

**Temper: gentle and purposeful.** Motion explains a change (something opened, something was added, the next slide came in) or eases content into view; it never decorates for its own sake or competes with the products.

**Tokens** (`snippets/css-variables.liquid`, owned by the motion reference): `--motion-duration-fast` (250ms) for hover and press, `--motion-duration-base` (400ms) for opening panels and switching tabs or slides, `--motion-duration-slow` (500ms) for larger surfaces, and the reveal set (`--motion-reveal-*`, about 1s with a stagger) for content entering on scroll. Easing: `--motion-ease-enter` for things arriving, `--motion-ease-exit` for things leaving. No raw durations or easing curves in sections.

**What moves:**

- Scroll reveal: headings and blocks rise slightly and fade in, once, in reading order. First-viewport content is visible without it (no reveal on the hero's heading and image).
- Hover: the small changes in Component States, within the fast duration.
- Rails and slideshows: slide on request (arrows, swipe, dots). Autoplay, where a merchant enables it, is slow and pauses on hover and focus; on devices that cannot hover it shows a pause button.
- Marquee: slow continuous scroll of one line.
- Overlays: drawers slide from their edge, dialogs fade and rise slightly, scrims fade.
- The 3D moment: a slight tilt and the backdrop appearing, within the base duration.

**Reduced motion and the switch.** Under `prefers-reduced-motion: reduce`, and when the merchant turns `motion_enabled` off, reveals show content at once, the marquee and autoplay stop, tilts and zooms are removed, and overlays appear without travel (a short fade at most). No state or content depends on an animation finishing.

## Design Defects

What the home design shows but `design.md` does not follow, so nobody copies it later:

- No colour or text styles in the file; every value is hardcoded, with near-duplicates (six greens, three limes). Colours come from the five schemes instead.
- The 375 frame is the desktop scaled to 60% (19.2px, 11.2px and 31.02px sizes); its values are unusable, only its arrangement is read. No tablet frame exists.
- Stray families: Manrope labels, Roboto Mono italic step labels, prices and slide numbers, one Poppins heading. One family is used instead.
- Rails on mobile show half a card at the edge (category and testimonial rails); the intended behaviour is one centred card at a time.
- Product card actions appear on hover only; touch has no way to reach them.
- Off-palette badge colours (orange sale, tan new, slate sold out) and rating yellow below 3:1 on light backgrounds.
- Brand and copy errors in the frames: the mobile logo and footer read "Eccenova"; placeholder copy (Momonise, Sunglass, Lorem ipsum, every list row numbered 01, every heading tab counting 28); typos in the testimonial quotes and footer. Copy is merchant content and is not taken from the design.
- A black wave shape at the bottom of the mobile icon row, not present on desktop; treated as an artefact.
- Only one hover state (one product card, one category card) and no focus, disabled, loading, error or empty states; Component States defines them.
