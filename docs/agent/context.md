# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-26.

## Plan HT1: tablet media ratios and Swiper dot targets (backlog group 4, part A)

**Outcome.** At tablet widths (768 to 1023) `scroll-categories` and `promo-bannder` no longer stack full-width square or portrait images several screens tall, and every Swiper pagination dot has a 24px touch target with the visible dot unchanged.

**Decided (user, 2026-10-26).** 4:3 media below the two-column layout for both sections; Swiper dots enlarged in the shared dot owner block; CSS only. Item "small text links" closed as no defect (below).

**Evidence (coordinator, 2026-10-26, Chrome DevTools MCP).** Tablet sweep at 768 and 1024 (overflow, overlap, small text, tap targets, image distortion): no overflow or real overlap; `scroll-categories` 4746px at 768 (five rows, each a 729px square image); `promo-bannder` 5184px at 768 (three panels of 1728px, a 4:5 full-width image each); `featured-products` titles wrap beside the price at 1024 (part C). Lighthouse accessibility snapshot at 390 and 1024: 97; `target-size` fails only on 10 Swiper dots (8px, 2 to 8px apart); text links and the quantity button pass through the WCAG 2.5.8 spacing exception. SEO `link-text`: three "Read more" links of the placeholder `blog-stories` cards (they carry `aria-label`; demo content, no change).

**Implementation surface.** `sections/scroll-categories.liquid` and `sections/promo-bannder.liquid` `{% stylesheet %}`; `tailwind/tailwind.components.css` (the carousel pagination dot owner block and the vertical gallery pagination gap), then `npm.cmd run build:tw`.

**Review tier.** Show (stylesheets and Tailwind source only).

**Estimate:** 1.5 hours.

**Checkpoint:** after the screenshots, before the commit.

**Bar:** Must fix: a change at 390 or from 1024 up in the two sections; a dot target under 24px; the active dot not distinguishable; a new `test:layout` issue. Accepted residue: dot spacing grows to 24px between centres. Judged on the default preset.

**Acceptance checks.**
1. 768: `scroll-categories` media 4:3, section height recorded before and after; `promo-bannder` media 4:3, panel height recorded before and after; 390 and 1024 heights unchanged.
2. Lighthouse accessibility snapshot at 390 and 1024: no `target-size` node.
3. Dots: computed bullet box 24 by 24, visible dot 8px, active dot in the scheme foreground; the product page gallery (vertical pagination at desktop) and `featured-product` checked.
4. `npm.cmd run build:tw`, `npm.cmd run scan:compat`, `npm.cmd run lint:theme`, `npm.cmd run test:layout -- --widths 390,768,1024,1440` with 0 new issues (the baselined Swiper bullet entries may be pruned with `--prune-baseline`).

**History.** Authorized by the user 2026-10-26 ("可以，没问题"); implemented by the coordinator in this session.

**Validation (coordinator, 2026-10-26, Chrome DevTools MCP).**
1. 768: `scroll-categories` 4746 to 3835px, media 1.333 (4:3); `promo-bannder` 5184 to 4032px, panel 1728 to 1344px, media 1.333. 390: media 1 and 0.8 (unchanged). 1024: `scroll-categories` 683px, `promo-bannder` 2304px, media 1.383 and 0.667 (unchanged two-column values). The media queries use the allowed form `(width >= 48rem) and (width < 64rem)` after `lint:theme` rejected the range syntax.
2. Lighthouse accessibility snapshot: 390 and 1024 score 100, no `target-size` node (was 97 with 10 Swiper dots). SEO `link-text` (placeholder "Read more") unchanged, out of scope.
3. Dots: bullet box 24 by 24, `::before` dot 8px, inactive opacity 0.3, active dot `rgb(38, 61, 41)` at opacity 1; home `featured-product` vertical pagination at 1440: 10 dots in a column at 24px pitch, look unchanged.
4. `build:tw` done; `scan:compat` passed; `lint:theme` passed; Prettier on the changed files passed; `test:layout -- --widths 390,768,1024,1440` 0 new issues. Baseline pruning (`--prune-baseline` cannot run with `--widths`) is left to the readiness review's full sweep.

5. User look (Show tier): accepted 2026-10-26 ("目前看上去没问题").

**Status.** Executed and reviewed; waiting for the commit, then this plan is cleared.
