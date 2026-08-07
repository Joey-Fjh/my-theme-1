# Current Project Context

This file is the short cross-session handoff for the current branch. `AGENTS.md` remains the repository rule source. Git history is the record for completed packages and superseded audit detail.

## Current State

- Branch: `feat/ai-test`.
- Theme-code baseline before the current uncommitted launch-audit package: `597e819 fix(theme): finalize section presets and editor previews`.
- The working tree intentionally contains the user's authorized launch-audit changes. No commit or push has been made.
- No known theme-code defect remains from the former `temp commit` preset work.
- The user's Theme Editor QA passed for the corrected preset previews.

## Cursor Agent Adapter Status

- Cursor now has five thin role adapters under `.cursor/agents/`; they reuse the canonical `.agents/roles/` and `.agents/contracts/` sources instead of copying skills or role rules.
- The Cursor `subagentStop` hook adapter reuses the shared result validator. Static agent lint, hook unit tests, aggregate lint, and formatting checks pass.
- A live `/scout` run confirmed custom-agent discovery and the Composer model mapping. Its hook log exposed a Windows temp-file payload missing the outer opening brace; the Cursor adapter now normalizes that observed fragment before validation. A fresh live run still needs to confirm a successful hook entry and the correction loop. Until then, the primary agent must validate delegated envelopes explicitly or run the workflow sequentially.

## Current Launch-audit Package

- Section placement now limits header, footer, and overlay groups to their intended section types.
- Preset locale regressions, form-label wiring, filter IDs, quantity controls, and contrast-safe configured color schemes were repaired in the current working tree.
- The latest pass added skip links, scoped tab IDs, complete manual-activation keyboard navigation for shared tabs, keyboard-accessible hosted-video controls with focus handoff, non-duplicated countdown announcements, contact-form status semantics, and filtered Organization `sameAs` data.
- Search, header, collection, featured-product, and product-media tabs now share a complete tab/panel association contract. Anchor tabs support Space activation, thumbnail tabs expose orientation and localized media names, and inactive gallery media is removed from the accessibility tree.
- Liquid-driven strings used by Alpine now travel through escaped `data-*` attributes, including variant names/values, dialog IDs, cart keys, filter labels, and translated button states. Sort and localization popovers return focus to their trigger on Escape.
- Page-title suffixes are localized. The custom i18n and architecture linters now include `blocks/` and `templates/`, enforce the tab association contract, and reject translated or quoted Liquid strings embedded directly in Alpine expressions.
- Collapsed accordions and inactive thumbnail-gallery overlays no longer expose focusable descendants. Product-card hover actions reveal on keyboard focus, and all Liquid buttons now declare an explicit type.
- Collection pages retain the All/collection tab navigation while prioritizing the active `collection.title` and `collection.description`. The collection hero uses the collection image (or section fallback image) as a rounded cover background; height comes from centered copy + padding, with the rotating badge kept in the corner.
- Product titles now link to `product.url`. Required resource titles no longer use truncation on product cards, the collection-list page, or the article hero; compact truncation remains owned by Predictive Search and other non-required contexts.
- No global duplicate-H1 cleanup was pursued. The shared listing hero currently prioritizes native Shopify object titles for both collection and blog pages; schema/demo default copy and JavaScript loading architecture remain unchanged.
- Fresh validation passed: Tailwind build, aggregate lint, Shopify Theme Check (137 files, 0 offenses), `git diff --check`, and targeted source assertions. The latest accessibility/i18n pass did not require another Tailwind rebuild.

## Latest Preset And i18n Decision

- `presets[].settings` and `presets[].blocks[].settings` are preset instance values, not schema-locale copy.
- Do not place `t:` locale references in those preset values. Shopify does not resolve them there.
- Omit preset settings when the schema default already produces the intended result.
- A preset block should contain only its `type` unless it needs a real, non-default override.
- Keep `t:` for supported schema-localizable fields such as names, labels, help text, option labels, and preset names.

Project-wide audit after `597e819`:

- 28 section presets and 56 preset blocks were structurally valid.
- No unsupported `t:` value remained in preset instance settings.
- No preset value duplicated its schema default.
- No unused `preset_blocks` locale namespace remained.
- The only explicit preset overrides left were intentional: Footer headings `Pages` and `Social`, plus three icon choices in Icon with text.
- `npm.cmd run lint`, `npm.cmd test`, Shopify theme validation, and `git diff --check` passed.

## Remaining Work

### Open theme-code risks (2026-08-07 docs audit)

Implemented in the current uncommitted working tree (this session package of 6):

1. **Header super menu product-card scope** — per-series `scope_id` (`section.id-link.handle-series-i`); lite cards skip Quick View teleport.
2. **VariantPicker URL mutation** — `data-update-url` / `_updateUrl` gated; PDP only by default; Quick View / featured pass `update_url: false` and scoped `gallery_id`.
3. **Gallery / media-modal event scope** — slide-to emits gallery `id`; listeners ignore unscoped or mismatched ids; media-modal activate carries `dialogId`.
4. **aria-hidden + focusables** — marquee duplicates use `inert` + non-linked copies; announcement Swiper syncs inert/`aria-hidden`; gallery carousel slides and inactive thumbnail overlays use inert.
5. **Filter form/drawer ids** — `CollectionFiltersForm-{{ section.id }}` / `collection-filters-{{ section.id }}` threaded through collection + search Liquid and Alpine `formId`/`dialogId`.
6. **product-card `scope_id` default** — falls back to `section.id`, then `card-{product.id}` (not bare `'card'`).

Still deferred (not in the six):

- **Multi-H1** — previously deferred intentionally; still Theme Store risk on about/home compositions.

Already fixed earlier in this working tree: featured-products per-block `scope_id`, Quick View gallery id follows section scope, Share block checkbox-only (decoupled from `settings.social_*_link`).

### Launch / release (non-theme or evidence)

The current code package still needs storefront and Theme Editor visual QA before it is committed. Remaining launch work is external, release-oriented, or evidence-based:

- Confirm public documentation and support operations outside this repository.
- Complete asset and dependency provenance records.
- Produce and smoke-test the final submission ZIP.
- Capture the required Lighthouse performance and accessibility evidence.
- Verify the collection hero with and without `collection.image` / fallback image, long product/collection/article titles, shared-tab arrow/Space navigation, sort/localization Escape focus return, variants containing apostrophes, product-card and accordion focus behavior, thumbnail-gallery focus isolation and naming, video keyboard pause/play, skip-link focus, countdown screen-reader output, and contact-form success/error states in a real preview.
- Finalize demo-store presentation, listing copy, screenshots, release notes, and reviewer instructions.
- Submit to Shopify and address concrete reviewer feedback.

`config/settings_schema.json` already contains the project documentation and support URLs. Their external content and operating readiness are not a theme-code task and were intentionally not re-audited during the latest work.

## Reopen Conditions

Create a new code package only when a reproducible storefront or Theme Editor defect, a failed repository check, measured performance evidence, or Shopify reviewer feedback identifies a concrete issue. Do not restart the completed historical blocker packages from the old audit.

Protected merchant-owned files remain unchanged unless the user explicitly authorizes them. `config/settings_data.json` was explicitly authorized and is part of the current package; `templates/*.json` remain unchanged:

- `templates/*.json`
- merchant content, navigation, uploaded media, and color-scheme values
