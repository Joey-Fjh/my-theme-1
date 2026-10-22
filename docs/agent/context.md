# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-22.

## Batch R1: remove `google-map` and `about-stats`

Status: closed 2026-10-22. Review round 1 FAIL (evidence gaps only), round 2 PASS (separate session).

**Outcome.** The two old sections, which are not on the home page and have no new design, are gone with every reference to them. Decided by the user, 2026-10-22: of the five sections on the cleanup card (Google Map, Category Grid, Promo Banner, About Stats, Featured Testimonial), redesigned ones stay (`promo-bannder` 6-S9, `testimonial-featured` 6-S7, `category-grid` already replaced by `collection-list` 6-S3 and deleted in 6-C10); `google-map` and `about-stats` are deleted, files included, and a template that references them loses that section. This replaces the 2026-10-11 decision to keep them as merchant options.

**Dependencies.** None. `main` stays untouched; the deletion reaches `main` with the branch merge.

**Implementation surface.**
- Delete `sections/google-map.liquid`, `sections/about-stats.liquid`, `assets/about-stats-images.js`.
- `snippets/scripts.liquid`: the `about-stats-images` import-map entry.
- `templates/page.contact.json`: the `about_stats_VdURVD` section and its `order` entry (merchant change; commit trailer `Merchant-Change: user, 2026-10-22, remove about-stats`).
- `locales/en.default.json`: `sections.google-map` block, `accessibility.google_map`, and `accessibility.show_first_image` / `show_second_image` if no other consumer remains.
- `locales/en.default.schema.json`: `sections.about-stats`, `sections.google-map`, and the `about_stats` / `google_map` name keys elsewhere in the file (confirm what each one labels before removing).
- Validator data (user-owned harness, covered by this authorization; removal of dead entries only): `google-map` in `FRAME_FULL_ALLOWLIST` (`.agents/skills/check-theme-architecture/scripts/lib/page-frame-lint.js`), `sections/about-stats.liquid` in `migration-baseline.json`, `sections/google-map.liquid` in `stylesheet-ownership-baseline.json`.
- `docs/references/style-system/css-architecture.md`: the `google-map` row of the full-frame table; the 6-R1 note naming `sections/about-stats.liquid`.
- Records: the backlog line on optional sections already lists four.
- Generated: `assets/tailwind.output.css` rebuilt with `npm.cmd run build:tw` (CI diffs it); 59 lines of utilities only the deleted sections used are gone.

**Review tier: Ask** (deletes files, a JS asset, locale keys; changes Liquid, a template and validator data).

**Acceptance checks.**
1. `grep -rn "google-map\|google_map\|about-stats\|about_stats\|show_first_image\|show_second_image"` over the repository (excluding `.git`, `node_modules`) returns only lines in the record files under `docs/agent/` (or nothing).
2. `templates/page.contact.json` parses as JSON and its `order` is `["main", "blog_stories_YnnhHU"]`; no other template changed.
3. `npm.cmd run lint:theme`, `npm.cmd run lint:i18n`, `npm.cmd run lint:compat`, `npm.cmd run test:theme-check`, `npm.cmd run lint:doc-paths` pass; the `legacy-type-tier` count drops by the about-stats hit and the baselines shrink, never grow.
4. With `npm.cmd run shopify:dev` running, the contact page renders without a Liquid error and the dev upload reports no rejected file.

**Execution log (2026-10-22).**
- Deleted the three files (`git rm`); removed the import-map entry, the `page.contact` section and order entry, locale blocks `sections.google-map` (storefront), `sections.about-stats` and `sections.google-map` (schema; their `presets.about_stats` and `presets.google_map` were inside those blocks), `accessibility.google_map`, `accessibility.show_first_image`, `accessibility.show_second_image` (no other consumer); the three validator data entries; the reference table row; the 6-R1 note now reads `legacy-type-tier` 5.
- Check 1: grep outside `docs/agent/` returns nothing.
- Check 2: `page.contact.json` parses; `order` is `["main", "blog_stories_YnnhHU"]`; no other template in the diff.
- Check 3: `lint:theme` passed (three standing `dead-setting-unprovable` notes); `lint:i18n` passed including unused keys; `lint:compat` passed (stylelint, eslint, embedded 66 blocks); `test:theme-check` 157 files, no offenses; `lint:doc-paths` passed; `lint:records` passed (board 362 words). `npx prettier --check` on the changed files passed.
- Check 4: `npm.cmd run shopify:dev` started; dev log shows no error or rejected file. `/pages/联系我们` (the store page on `page.contact`) and the same page with `?view=contact` return 200, render the sections `main` and `blog_stories_YnnhHU` only, no `Liquid error`, no `about-stats` markup, contact form present.
- `npm.cmd run test:theme-architecture` (required by `check-theme-architecture` after a validator-script change): 248 pass, 0 fail.
- Review round 1 (2026-10-22, separate session): FAIL on the missing `test:theme-architecture` record and unproven check 4; no implementation defect. Both closed above.
- Board, same day (user): dropped the Stitch pipeline, the submission-waits-for-pipeline carried line, DesignSync, and the sites-reviewed carried line.
