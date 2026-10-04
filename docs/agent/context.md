# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-04.

## Batch 6-M1: simplify the settings-driven reveal motion

Status: planned 2026-10-04; execution by external prompt (user request). Review tier **Ask** (deletes settings, locale keys, attributes and module code; changes Liquid, `assets/*.js`, `config/settings_schema.json` and the agent rules in `docs/project.md`). Review: coordinator, then an independent reviewer; both must PASS. Browser checks run at the post-design browser pass.

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
