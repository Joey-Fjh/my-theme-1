# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-04.

## Batch 5-B1: fix the home slideshow stage size (R1, R2)

Status: executed and accepted; independent review PASS (2026-10-04). Authorized 2026-10-04 ("直接来"). Review tier **Ask** (Liquid markup in `sections/slides-show.liquid`). Reviewer: independent reviewer the user names. Browser recheck of R1 and R2 at the next browser pass.

### Outcome

The home `slides-show` is exactly one stage tall (`--section-stage-min-height`, 100svh) and exactly the viewport wide at every width, as the live theme is (`h-screen`). Evidence of the regressions: `docs/agent/board.md`, Evidence, browser pass parts 1 and 2.

### Cause

- `.section-frame--height-stage` (and `-stage-pc` from 48rem) is a one-row grid with `min-height` and no column template.
- The slideshow's module root (`div.h-full.w-full` holding the Swiper) is in flow. The grid track sizing uses its content: the slide image or 4:3 placeholder pushes the row height past the minimum (R2: 1068.75px at 1440×900), and the non-shrinking Swiper slides push the implicit `auto` column to their min-content width (R1: 1125px at 375 and 390). Percentage heights (`h-full`) do not cap content contribution during track sizing.

### Implementation surface

- `sections/slides-show.liquid`: the module root leaves the flow (`absolute inset-0` instead of `h-full w-full`), so the stage is sized by the frame alone. The copy overlay is already absolute inside each slide.
- `snippets/section-frame.liquid` `{% stylesheet %}`: the stage grids get `grid-template-columns: minmax(0, 1fr)`, so no stage child can widen the frame past its container (guards the other stage users with Swiper rails: routine-showcase, testimonial-featured).

### Acceptance checks

- B1: `git diff --stat` touches only the two files above plus the record files.
- B2: the slideshow module root carries `absolute inset-0`; `data-module-id`, `x-data`, `data-swiper-src` unchanged.
- B3: both stage rules (`.section-frame--height-stage`, `.section-frame--height-stage-pc`) declare `grid-template-columns: minmax(0, 1fr)`; nothing else in the frame changes.
- B4: `lint:theme`, `test:theme-architecture`, `test:theme-check`, `lint:liquid-syntax`, `scan:compat` pass; `npx prettier --check` on changed files.
- B5 (browser, next pass): at 375, 390, 1440 the first section is exactly viewport-wide and one screen tall (dev against live); copy wraps; the next section starts at one screen; no-JS at 390 shows the same; the other stage sections (404, routine-showcase, testimonial-featured) keep their height.

### Progress

Executed 2026-10-04 by the coordinator. Diff: `sections/slides-show.liquid` (module root `h-full w-full` → `absolute inset-0`), `snippets/section-frame.liquid` (`grid-template-columns: minmax(0, 1fr)` on both stage rules), plus the record files.

| Check | Result |
| --- | --- |
| B1 | `git diff --stat`: `sections/slides-show.liquid` 1 line, `snippets/section-frame.liquid` 2 lines, `docs/agent/board.md`, `docs/agent/context.md` |
| B2 | module root keeps `data-module-id="slides-show"`, `x-data="slidesShow()"`, `data-swiper-src`; `assets/slides-show.js` reads no size from it (grep for `h-full`, `offsetHeight`, `clientHeight`, `getBoundingClientRect`: none) |
| B3 | both stage rules gain the column template; no other frame line changed |
| B4 | `lint:theme` passed; `test:theme-architecture` 155 pass, 0 fail; `test:theme-check` 146 files, no offenses; `lint:liquid-syntax` passed; `scan:compat` passed (55 stylesheet blocks); `npx prettier --check` on the four changed files passed |
| B5 (partial, coordinator spot check on the dev server, Chrome DevTools MCP) | 1440×900: frame, inner and module root 1425×900 (15px scrollbar), content grid 1405×699.41 (live 699), next section at 900, `scrollWidth` 1425. 390×844 mobile: frame and inner 390×844 (was 1125 wide), heading 370×84 on two lines (live 370×84), next section at 844, `scrollWidth` 390. Not run: 375, no-JS, live side by side, other stage sections at desktop |

### Independent review (2026-10-04): PASS

No findings. B1–B4 re-run and passed; the cause confirmed from the CSS chain; nothing in `assets/slides-show.js`, `assets/carousel-swiper.js`, motion reveal or the no-JS state depends on the in-flow root; `.section-frame__inner` is the positioned ancestor. Other stage users (404, routine-showcase, testimonial-featured): unchanged when content fits; wide content now stays inside the frame's `overflow: hidden` instead of widening it. Dev geometry: 1440×900 hero 900 tall, next section at 900; 390×844 inner 390, heading 370×84; 375×812 inner 375, hero 812, `scrollWidth` 375. Unproven: live side by side (live stayed on the password form) and the rest of B5, carried to the next browser pass.
