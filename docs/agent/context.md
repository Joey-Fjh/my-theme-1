# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-04.

## Batch 6-M1: simplify the settings-driven reveal motion

Status: executed by external prompt 2026-10-04 (validators M7 pass, M8 browser deferred); coordinator review PASS with one fix; independent review rounds 1 and 2 FAIL, findings fixed by the coordinator; round 3 PASS (2026-10-04). Accepted. Review tier **Ask** (deletes settings, locale keys, attributes and module code; changes Liquid, `assets/*.js`, `config/settings_schema.json` and the agent rules in `docs/project.md`). Review: coordinator, then an independent reviewer; both must PASS. Browser checks run at the post-design browser pass.

### Outcome

The direction accepted on `docs/agent/board.md` (user, 2026-10-04): the only motion driven by the theme motion settings is the in-sequence appearance of list and card items. One switch, `motion_enabled`, controls it.

- **Remove:** the media reveal (images, video, product media), the per-element text and copy reveal (headings, text, hero copy, content-group sequences), the critical and first-viewport reveal paths, and the four style settings `content_reveal_style`, `media_reveal_style`, `motion_speed`, `reveal_behavior` with their locale keys and CSS variables.
- **Keep, unchanged in behaviour:**
  - the list and card cascade (today `data-motion-cascade`) in blog, blog-stories, category-grid, collection, collections, featured-products, icon-with-text, philosophy-section, promo-bannder, scroll-categories, product recommendations, search results; plays once per page view;
  - icon and link animations, hover, focus, dropdown, drawer, dialog, toast, loading and spinner motion;
  - the decorative loops (watermark marquee, scrolling-icon-with-text, rotating badge) and their existing `motion_enabled` and `prefers-reduced-motion` guards.
- **`motion_enabled`:** same setting ID, so the merchant data in `config/settings_data.json` stays valid; the label and info may be reworded to "scroll and reveal animations". Off: no cascade, and the decorative loops stop as today. Future GSAP choreography will also follow it (recorded in the contract, nothing to build now).
- `prefers-reduced-motion: reduce` disables the cascade as well.
- No content is ever hidden without JavaScript or before the cascade runs (`AGENTS.md`, first-viewport rule). Items that the cascade never reaches stay visible.

### Implementation surface

- `assets/motion-reveal.js`: reduce to the cascade only. Keep the module ID `motion-reveal`, the component name `motionRevealSection` used on `section-frame` roots, its import-map entry in `snippets/scripts.liquid`, and the lifecycle (`destroy`, Theme Editor section reload). Remove the copy, sequence, critical, media, replay (`reveal_behavior: always`) and speed paths.
- `tailwind/tailwind.animates.css`, `tailwind/tailwind.elements.css`: remove the reveal rules for removed attributes and settings; keep the cascade rules and every rule listed under "Keep"; rebuild `assets/tailwind.output.css` with `npm.cmd run build:tw`.
- `layout/theme.liquid`: remove `data-content-reveal-style`, `data-media-reveal-style`, `data-reveal-behavior`; keep `data-motion-enabled`.
- `snippets/css-variables.liquid`: remove the `motion_speed` and reveal amplitude variables; keep any variable a kept rule still reads.
- `config/settings_schema.json`: remove the four settings and their header or paragraph entries; keep `motion_enabled` (wording may change).
- `locales/en.default.schema.json` (and any other `*.schema.json`): remove the keys only the removed settings used; reword the `motion_enabled` label if changed.
- `sections/*.liquid` and `snippets/*.liquid` that carry reveal markers or parameters: remove `data-motion-reveal`, `data-motion-copy`, `data-motion-copy-bound`, `data-motion-sequence`, `data-motion-critical`, `data-motion-hero-copy`, `data-motion-index`, `data-motion-media` and the bindings that only served them; keep `data-motion-cascade` targets and whatever the cascade reads. Primitive parameters `motion_reveal` (`image`, `heading`, `text`, `content-group`, product media snippets) are removed from the snippets and from every caller; `section-frame` keeps `motion` only if the cascade still needs a section root mount.
- `docs/project.md`: rewrite "Merchant motion settings" and "Ordinary reveal pattern" (Theme-Specific Contracts) to the new contract (approved with the direction).
- `docs/references/architecture/javascript-runtime.md`, `docs/references/architecture/motion-architecture.md`: update only where they describe the removed paths.
- `docs/migration/phase0/browser-checklist.md`: update the "Retained theme contracts" motion rows to the new contract.
- **Forbidden:** `config/settings_data.json`, `templates/*.json`, `sections/*-group.json`, vendor files, validators and `package.json`, and any visual or layout change beyond removing reveal motion.

### Acceptance checks

- M1 Inventory first: a table of every reveal marker and parameter at `HEAD` (file, marker, kept or removed, reason), produced by grep, with counts from commands.
- M2 After: `grep -rn` for each removed attribute, setting ID and parameter across `sections snippets layout assets tailwind config locales` returns nothing (show the commands). `data-motion-cascade` remains in the 12 files listed under "Keep" (counts before and after).
- M3 `config/settings_schema.json` has `motion_enabled` and none of the four removed IDs; every removed locale key has no remaining reference (`lint:i18n` unused-key check).
- M4 `assets/motion-reveal.js`: raw size before and after; exports, module ID and component name unchanged; no listeners, observers or timers left without cleanup in `destroy`.
- M5 No-JS and first viewport: no kept rule hides content before JavaScript (show the CSS for the cascade's initial state and its JS-ready gate).
- M6 Compiled CSS: `git diff --stat assets/tailwind.output.css` plus the list of removed and kept selector families; no rule outside motion changes.
- M7 Validators: `lint:theme`, `test:theme-architecture`, `test:theme-check`, `lint:liquid-syntax`, `lint:compat`, `scan:compat`, `lint:i18n`, `lint:doc-paths`, `doctor:agent`, and `npx prettier --check` on every changed file.
- M8 Browser checks for the post-design pass (listed, not run): cascade on a collection grid, featured products tabs, blog cards and recommendations; `motion_enabled` off; reduced motion; Theme Editor section reload; headings, text and images appear without motion; decorative loops unchanged.

### Progress

#### M1 — inventory (at `HEAD` before edits; counts from ripgrep)

| Marker / parameter | Approx. occurrences (sections+snippets+layout+assets+tailwind+config+locales) | Disposition | Reason |
| --- | --- | --- | --- |
| `data-motion-reveal` | 80+ in sections/snippets; CSS/JS | **Removed** | Per-element reveal retired; cascade uses `data-motion-bound` |
| `data-motion-copy`, `data-motion-copy-bound` | 30+ | **Removed** | Split copy reveal retired |
| `data-motion-sequence` | 5 | **Removed** | Sequence stagger retired; JS assigns row indices |
| `data-motion-critical`, `data-motion-critical-runtime` | 10+ | **Removed** | First-viewport reveal path retired |
| `data-motion-hero-copy`, `data-motion-index` | slides-show, hero | **Removed** | Hero/stagger attributes retired |
| `data-motion-media` | slides-show section root | **Removed** | Media reveal retired |
| `motion_reveal` param | 200+ render calls + snippets | **Removed** | Primitive retired from heading/text/image/gallery |
| `content_reveal_style`, `media_reveal_style`, `motion_speed`, `reveal_behavior` | settings_schema, theme.liquid, locales, css-variables | **Removed** | Single `motion_enabled` switch |
| `data-motion-cascade` | 12 files (plan list) | **Kept** | Only settings-driven reveal |
| `data-motion-bound` | cascade row items | **Kept** | Cascade animation target |
| `data-motion-section`, `motionRevealSection`, `motion-reveal` module | section-frame + nested grids | **Kept** | Lifecycle mount for cascade |
| `data-motion-state` | JS + CSS | **Kept** | pending/revealed gate (no hide without JS) |
| `body[data-motion-enabled]` | theme.liquid | **Kept** | Merchant kill switch for cascade + loops |

`assets/motion-reveal.js` raw size: **53915** bytes before → **29783** bytes after (`Get-Item` length).

#### M2 — grep after (scoped paths)

Commands (all returned **0** matches in `sections`, `snippets`, `layout`, `assets`, `tailwind`, `config`, `locales`):

- `data-motion-reveal`, `data-motion-copy`, `data-motion-sequence`, `data-motion-critical`, `content_reveal_style`, `media_reveal_style`, `motion_speed`, `reveal_behavior`, `motion_reveal`

`data-motion-cascade` remains in **12** files: `sections/blog.liquid`, `blog-stories.liquid`, `category-grid.liquid`, `collection.liquid`, `collections.liquid`, `featured-products.liquid`, `icon-with-text.liquid`, `philosophy-section.liquid`, `promo-bannder.liquid`, `scroll-categories.liquid`, `snippets/product-recommendations-section.liquid`, `snippets/search-results-tabs.liquid`.

#### M3 — settings / locales

- `config/settings_schema.json`: only `motion_enabled` (+ info) under Animations.
- `lint:i18n` + unused-key lint: **passed**.

#### M4 — `motion-reveal.js`

- Module id `motion-reveal`, factory `motionRevealSection`: unchanged.
- Cascade-only; `destroy()` clears timers, frames, cascade observers, editor hooks.

#### M5 — no-JS / first viewport

Cascade CSS (`tailwind/tailwind.animates.css`): no `data-motion-state` rule without JS setting `pending`; default visible. Pending styles apply only after runtime sets `data-motion-state="pending"`.

#### M6 — compiled CSS

- `assets/tailwind.output.css`: rebuilt via `npm.cmd run build:tw` (see `git diff --stat`).
- Removed selector families: `data-motion-reveal`, `data-motion-copy`, `body[data-content-reveal-style]`, `body[data-media-reveal-style]`, critical/always-reset/staging.
- Kept: `[data-motion-cascade] [data-motion-bound][data-motion-state=…]`, decorative loop guards, dialog/drawer/toast motion (unchanged blocks).

#### M7 — validators (2026-10-04)

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | pass |
| `npm.cmd run test:theme-architecture` | 155/155 pass |
| `npm.cmd run test:theme-check` | 146 files, no offenses |
| `npm.cmd run lint:liquid-syntax` | pass |
| `npm.cmd run lint:compat` | pass |
| `npm.cmd run scan:compat` | pass (includes `build:tw`) |
| `npm.cmd run lint:i18n` | pass |
| `npm.cmd run lint:doc-paths` | pass |
| `npm.cmd run doctor:agent` | pass (exit 0) |
| `npx prettier --check` on all changed files | pass after `--write` on formatted files |

#### M8 — browser (deferred)

Collection grid, featured products tabs, blog cards, recommendations; `motion_enabled` off; reduced motion; Theme Editor section reload; static headings/images; decorative loops unchanged.

### Coordinator review (2026-10-04): PASS after one fix

- Scope: changed paths stay inside the surface; no change to `config/settings_data.json`, `templates/*.json`, section groups, vendor files, validators or `package.json`. `settings_data.json` keeps orphan `reveal_behavior` values (lines 17, 88), ignored by Shopify, as expected.
- Leftovers: `grep -rn` for the removed settings, attributes and `motion_reveal` across `sections snippets layout assets tailwind config locales` finds only those orphan values.
- No-JS: the cascade hides an item only after the module sets `data-motion-state="pending"` (`tailwind/tailwind.animates.css`, cascade block); `body[data-motion-enabled='false']` and `prefers-reduced-motion` rules keep items visible.
- Contract: `docs/project.md` "Merchant motion settings" and "Ordinary reveal pattern" match the accepted direction.
- **Fixed by the coordinator:** `_matchesSection` in `assets/motion-reveal.js` compared `el.dataset.sectionId`, which the four new nested cascade roots (blog, collection, product recommendations, search results) do not carry, so Theme Editor `section:select` / `section:reorder` never replayed them. It now reads the id from `el.closest('[data-section-id]')`, the section-frame root that wraps each of them.
- Not a defect, noted: `assets/motion-reveal.js` is 29.8 KB (was 53.9 KB), not the ~5 KB the coordinator estimated. The executor kept the existing cascade machinery (row grouping, clip visibility, page-load queue, editor replay, relayout) to keep the cascade's behaviour unchanged, as the plan required. A smaller rewrite would change timing details; candidate for the design phase once the cascade's look is decided.
- Re-run by the coordinator: `lint:theme` passed; `test:theme-architecture` 155 pass, 0 fail; `test:theme-check` 146 files, no offenses; `lint:liquid-syntax`, `lint:compat`, `lint:i18n` (and unused keys), `lint:doc-paths`, `doctor:agent` passed; `build:tw` reproduces the output; `npx prettier --check` on every changed file passed.

### Independent review round 1 (2026-10-04): FAIL, two findings, fixed by the coordinator

1. `sections/slides-show.liquid`: a blank line before `{% endstylesheet %}` left by the removed motion properties failed `npx prettier --check` (M7). The line is removed.
2. `sections/page.liquid` (`heading`) and `sections/philosophy-section.liquid` (`content-group`) still passed `motion_attrs: ''`, a parameter neither snippet documents or reads (inert, but fails the removal check). Both arguments are removed; `git grep motion_attrs -- sections snippets` is empty.

Also removed, from a review note: `data-motion-bound` in `sections/before-after-comparison.liquid` (2), `sections/promotion-countdown.liquid`, `sections/testimonial-featured.liquid`, which have no `data-motion-cascade` ancestor, so the attribute had no reader.

Re-run: `npx prettier --check` on all 57 changed files passed; `lint:theme` passed; `test:theme-check` 146 files, no offenses; `lint:liquid-syntax` passed; `scan:compat` passed. The IDE schema warning on `sections/slides-show.liquid` `disabled_on.groups` (`custom.overlay`) predates this batch and is not a Theme Check offense.

### Independent review round 2 (2026-10-04): FAIL, three findings, fixed by the coordinator

1. `sections/promo-bannder.liquid`: the cascade lost its targets. At `HEAD` the cards carried `data-motion-reveal="content"`; the batch removed it without marking them `data-motion-bound`, and the only bound marker sat on the hero link outside the cascade. The cards now carry `data-motion-bound`; the hero link marker is removed.
2. `sections/scroll-categories.liquid`: a `data-motion-bound` caption outside the cascade, removed.
3. `snippets/product-card.liquid`: the card root always carried `data-motion-bound`. Inside the product cascades (collection, featured-products, recommendations, search) each card already sits in a `data-motion-bound` wrapper, so `querySelectorAll('[data-motion-bound]')` collected both and the two pending opacities compounded; in `snippets/header-dropdown-super-menu.liquid` it had no reader. The root marker is removed.

Found by the coordinator while checking these: `sections/blog-stories.liquid`, the block-based card branch (used when no blog is selected) lost its target the same way as promo-bannder; it now carries `data-motion-bound`.

Static check, every cascade file at `HEAD` against now (`git show HEAD:<file>` and the working tree, `data-motion-cascade`, `data-motion-reveal`, `data-motion-bound`): each former cascade item now carries `data-motion-bound`; every remaining `data-motion-bound` file also has a cascade (category-grid outputs its captured items inside the cascade).

Browser (dev, Chrome DevTools MCP, DOM only): `/collections/all` 12 cards, 12 targets, 0 nested; home: category-grid 8, featured-products 8, scroll-categories 4, promo-bannder 2, blog-stories 3 targets, 0 nested, 0 outside a cascade; each set is `pending` before it enters the viewport and `revealed` after `scrollIntoView`.

Re-run: `npx prettier --check` on every changed file passed; `lint:theme` passed; `test:theme-architecture` 155 pass, 0 fail; `test:theme-check` 146 files, no offenses; `lint:liquid-syntax` passed; `scan:compat` passed.

### Independent review round 3 (2026-10-04): PASS

No findings. Every direct cascade item at `HEAD` now carries `data-motion-bound` in all twelve files and every Liquid branch; no nesting; no marker outside a cascade (the super menu's product cards no longer emit it). Browser: home five cascades and `/collections/all` progress from `pending` to `revealed`; 0 nested, 0 strays. Unproven: inactive featured-products tabs and empty states were not opened.
