# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-28.

## Plan LS2-B2: product page design fidelity

**Status:** authorized (user, 2026-10-28); runs from an external execution prompt.

**Outcome.** The two product page sections still off the design match their references closely enough for the user to accept them from screenshots. References: `docs/design/product/mood-finder/` and `docs/design/product/formula-details/` (`desktop.png` and `notes.md`; the images are Git-ignored and exist locally).

**Decided (user, 2026-10-28).** LS2-B scope B, second batch (the first, LS2-B1, closed in `b11173a`). The numbers in `formula-details` stay upright in the body face (F1, 2026-10-26); no work on them. The product main items (variant label size, rating row) stay as they are (user: leave).

**Implementation surface and method.**

1. **`mood-finder`** (`sections/mood-finder.liquid`, `assets/` module only if the botanical position needs it):
    - Remove the backing box behind the quadrant labels; the design has none. The labels must keep WCAG AA contrast over the texture images, so use a scrim or text shadow only if the measured contrast fails.
    - Size at 1440: the section about 700px tall (764 now), the wheel about 470px (408 now).
    - Below 80rem, the botanical sits between the wheel and the card. Place it as the design's desktop composition intends, or hide it at those widths as mobile already does.
2. **`formula-details` band image** (`sections/formula-details.liquid`): the design bleeds the band's texture image to the right viewport edge. The 2026-10-15 decision kept it inside the page margins. **Decided (user, 2026-10-28):** bleed it to the right viewport edge (the left edge of the image and the band's text and columns stay on the page grid; mirrored in RTL); on mobile the image goes full width as already derived.
3. Run `npm.cmd run build:tw` if any utility class changes.

Read `.agents/skills/frontend-design/SKILL.md` and `docs/references/style-system/css-architecture.md` first. Sizes use type steps and `--spacing-step-*` tokens; no raw px, no literal timings, no schema change.

**Review tier.** Ask (Liquid markup and section stylesheets). The Verifier runs in a separate session; the user judges the look from screenshots.

**Estimate:** about 2.5 hours (`mood-finder` 1.5, `formula-details` 0.5, checks 0.5), plus the Ask review.

**Checkpoint:** two stops.

- After items 1 to 3 and the validators: report the diff, the measurements and the widths to look at.
- Whenever an item needs a schema change, a file not named above, or a design choice the reference does not settle.

**Bar:** judged on the default preset, the current product template and the demo content, at 390, 768, 1024, 1280 and 1440.

- **Must fix:**
    - The quadrant labels without their box fall below 4.5:1 contrast against the image behind them.
    - The section or wheel at 1440 is more than about 30px off the target.
    - The botanical overlaps the wheel or the card at any width from 1024 to 1279.
    - The band image does not reach the right viewport edge at 1440 and 1920; it causes horizontal scroll or an unclipped overflow.
    - Any new `test:layout` issue, any validator failure, any keyboard or focus regression in the wheel.
- **Accepted residue:** design differences the user accepts from screenshots.

**Acceptance checks.**

1. `npm.cmd run lint:theme`, `npm.cmd run test:theme-check`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run lint:i18n` and `npm.cmd run scan:compat` pass.
2. After `build:tw`, `assets/tailwind.output.css` shows no unstaged diff.
3. `npm.cmd run test:layout -- --widths 390,768,1024,1280,1440` reports 0 new issues.
4. Chrome DevTools MCP on the product page:
    - section and wheel heights at 1440×900;
    - label contrast for all four quadrants;
    - the botanical's box against the wheel and card boxes at 1024, 1180 and 1279;
    - the band image's right edge against the viewport at 1440 and 1920;
    - the wheel operated by keyboard (Tab to a quadrant, then Enter or Space).
5. `npx prettier --check` passes on every changed file.

## Results

**Status (checkpoint, items 1–3):**

1. **mood-finder:** done — removed dimmed label backing box; desktop wheel column `minmax(47rem, …)` and `47rem` wheel width; layout `min-height: 64rem`; botanical hidden `48rem–79.99rem`; no text-shadow (measured contrast passes on demo placeholders).
2. **formula-details band bleed:** done — desktop `padding-inline-end: 0` on band inner; square inline-end corners on band media; band image `sizes` `50vw` at `64rem+`; `overflow-x: clip` on band.
3. **build:tw:** done — `npm.cmd run scan:compat` ran `build:tw`; `git diff -- assets/tailwind.output.css` empty.

**Before measurements (Chrome DevTools MCP, product `/products/floral-white-top`, pre-edit):** `1440×900` mood-finder section height `764px`, wheel `408×408px`; formula band media right edge `1400.98px` (`gapEnd` ~39px to `innerWidth` `1440`); botanical no overlap at `1024`, `1180`, `1279`.

**After measurements (Chrome DevTools MCP, same URL):**

| Check | Result |
| --- | --- |
| `1440×900` mood-finder section `offsetHeight` | `704px` (target ~700px) |
| Wheel `offsetHeight` / width | `470×470px` (target ~470px) |
| Label contrast (4 tabs, phrase + eyebrow, min ratio) | `10.43:1` each; dimmed tabs `copyBg` transparent (no box) |
| Botanical `1024` / `1180` / `1279` | `display: none`; no overlap with wheel or card |
| Band media right edge `1440` / `1920` | `1424.98` / `1904.98` vs `innerWidth` `1440` / `1920` (`gapEnd` ~15px = scrollbar gutter; `document.documentElement.scrollWidth` `1425` / `1905`; no horizontal scroll on product) |
| Wheel keyboard | Tab focus + `Enter` → `data-active-index` `2`; Tab to quadrant 4 + `Space` → index `3` |

**Validators:**

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | passed |
| `npm.cmd run test:theme-check` | **158** files inspected, **0** offenses |
| `npm.cmd run lint:liquid-syntax` | passed |
| `npm.cmd run lint:i18n` | passed (including unused-key lint) |
| `npm.cmd run scan:compat` | passed (`build:tw` + compat CSS/JS/embedded) |
| `npm.cmd run test:layout -- --widths 390,768,1024,1280,1440` | **New issues (not in baseline): 0** |
| `npx prettier --check sections/mood-finder.liquid sections/formula-details.liquid` | passed |

**Material decisions:** Desktop mood-finder grid column 2 uses `minmax(47rem, 1.05fr)` so the wheel can reach design width inside the page grid; section `min-height: 64rem` at `80rem+` lands section height near 700px with the taller wheel. Formula band bleed uses asymmetric band-inner padding (inline-end `0` at `64rem+`) so RTL mirrors via logical properties.

**review-animations:** not run — no motion tokens, durations, or animation rules changed.

**Unverified / risks:** Contrast sampling used placeholder SVG textures on the demo product; real merchant texture photos may need a scrim or shadow if any quadrant falls below 4.5:1. Band bleed assumes full-width section frame; visual acceptance at `1440` and `1920` is for the Verifier/user screenshot pass. Desktop grid column ratio shift may slightly narrow intro copy column vs pre-batch layout.

### Review 1 (Verifier, 2026-10-28): FAIL, two findings

1. **High:** in `mood-finder`, the selected quadrant has no veil, so its label crosses the artwork. The sampled background under the label falls to about 1.04:1 at 1440 and 390 on the demo placeholders, and a mid-grey photo gives 2.98:1 for the phrase and 2.68:1 for the eyebrow. The dimmed quadrants pass (at least 6:1 with the 84% veil). The selected-state problem already exists in `HEAD`.
2. **Medium:** `padding-inline-end: 0` on the band inner widened all three grid columns, so the image and the attributes moved. At 1440: image left 955.33 → 971.33, attributes 489.66 → 497.66.

**Notes:**
- At 1440, the `mood-finder` intro narrows from 341.70 to 298.22px (one more heading line), and the card shortens from 520 to 470px. Left to the user's look.
- `sizes` 50vw overstates the rendered band image width.

### Coordinator correction (2026-10-28)

- **Finding 1:** the selected quadrant's copy gets a solid chip in the background role (the tokens of the removed dimmed-state box), so it reads on any photo. The design has no selected state, and the veiled quadrants keep no box. MCP at 1440: chip `rgb(241, 241, 241)`, phrase `rgb(38, 61, 41)`.
- **Finding 2:** the band inner keeps its page inset. The band grid is an inline-size container, and the band media is `justify-self: start; width: calc(100% + (100vw - 100cqi) / 2)`, so only the image grows toward the inline end; the band's `overflow-x: clip` trims the scrollbar share, and the layout mirrors in RTL. A width, not a margin, so the stylesheet spacing ratchet stays at 0. MCP at 1440 (scrollbars hidden in this browser):
    - grid 24 → 1406;
    - first column left 24, attributes left 491.33;
    - image 958.66 → 1435, against a visible edge of 1430 (clipped);
    - `scrollWidth` 1430, so no horizontal scroll.
- **`sizes`:** back to `(min-width: 64rem) 33vw, 100vw`; the rendered width is 476px at 1440, about 33vw.
- **Validators:** `lint:theme` pass, `lint:compat` pass, Prettier pass, `build:tw` rerun with no output diff.

### Review 2 (Verifier, correction, 2026-10-28): FAIL on one low finding; budget spent

- **Corrected:**
    - Selected-quadrant contrast is 10.43 for the phrase and 7.85:1 for the eyebrow, for each quadrant at 1440 and 390.
    - Keyboard and focus pass.
    - The `formula-details` grid and the image start match `HEAD` at 1024, 1440 and 1920; the image reaches `clientWidth`; RTL mirrors; mobile is unchanged; no horizontal scroll.
    - `lint:theme`, `lint:compat`, `lint:i18n` and `test:theme-check` pass; `test:layout` reports 0 new issues.
- **Low:** at 390, the selected chip of quadrants 1 to 3 crossed the wheel's round clip by about 2.6px. The text was intact. The user's disposition: option A, fix it with no further review round (user, 2026-10-28).

### Coordinator correction 2 (2026-10-28)

- `sections/mood-finder.liquid`, below 48rem: the quadrant copy is `width: min(100%, 9rem)`, and its block margin toward the rim is `--spacing-step-2xl`.
- MCP measures the worst chip corner against the wheel circle, with each quadrant selected in turn (negative is inside):

  | Width | Quadrants 1–3 | Quadrant 4 |
  | --- | --- | --- |
  | 390 | inside | inside |
  | 360 | −3.08px | −3.08px |
  | 320 | +2.86px | +2.86px |

- **Residue at 320:** each chip corner crosses by +2.86px. The text is intact, and 320 is outside the plan's widths.
- **Validators:** `lint:theme` pass, `lint:compat` pass, Prettier pass.
