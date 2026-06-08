# Agent Context

This is a user-maintained working notebook. Agents read it on demand when the user asks to continue previous work, review outstanding tasks, or prepare next-session context. Updates are manual; agents do not auto-update this file.

- `Next Topics`: actionable items tracked across sessions. Mark done items as done or remove them; add new items as they arise.
- `Next Session Template`: fill in before ending a session if the user asks for next-session context.

## Next Topics

- Review root entry points and confirm only agent entry adapters remain at the repository root.
- Review `agent-router` and the routing docs after real usage; then decide whether repeated docs references should become skills.
- Smoke-test tool adapter symlink resolution and confirm Claude reads `CLAUDE.md` and `.claude/skills`.
- Confirm CI runs `npm run lint` in GitHub after the branch is pushed.
- Plan MCP configuration for Shopify Dev MCP, Playwright MCP, Figma MCP, and Chrome DevTools MCP in a separate pass under tool-owned config directories.
- Decide whether to add optional skill UI metadata later; do not do it unless it clearly helps discovery.
- Global settings: candidate settings remain reserved in `config/settings_schema.json` and `locales/en.default.schema.json`; do not connect them to storefront runtime until each setting group and its behavior contract are explicitly approved.
- Global typography: the approved settings panel and base mapping chain are complete: settings -> `snippets/css-variables.liquid` -> `assets/base.css` / `tailwind/tailwind.typography.css` -> storefront inheritance and typography tiers. Heading and body family, weight, line height, letter spacing, text transform, and scale are mapped; scale affects font size only. Typography chain verified — all 18 settings correctly mapped through to `tailwind.typography.css` utilities.
- Global typography review: continue with human-led, file-by-file review. For each file, decide whether local `font-*`, `leading-*`, `tracking-*`, text-transform, `.h*`, and `.body-*` classes are intentional overrides or redundant declarations. Do not batch-delete or infer intent from repetition alone.
- Global typography review: do not introduce new feature- or component-specific typography combination classes by default. Keep the existing global defaults and typography tiers; record shared components, uncertain design choices, and skipped files for later decisions.
- Global typography follow-ups: review `.rte`, language/font fallback behavior, RTL support, and exceptional component typography as separate scoped decisions rather than mixing them into the file-by-file cleanup.
- Continuation/review stage boundary: when asked to read recent commits and this context to continue the task, this Agent only audits, classifies, and gives implementation guidance. Do not edit theme implementation files unless the user explicitly authorizes implementation.
- Global typography review findings: native heading elements with matching visual-tier classes are candidates for later cleanup, including `sections/article.liquid` (`h2.h2`), `sections/newsletter-banner.liquid` (`h2.h2.pc:h1`, where only the base `h2` is potentially redundant), and `sections/product-comparison-table.liquid` (`h5.h5`). Treat these as recommendations, not approved edits.
- Global typography review finding: `body` now matches the `body-md` typography tier. Remove redundant `body-md` only when the element naturally inherits from `body`; preserve it when resetting text nested inside another typography tier. Preserve responsive tier changes and uncertain weight, line-height, tracking, and text-transform overrides until reviewed individually.
- Global color chain: complete. 26 color settings in `settings_schema.json` map 1:1 to `css-variables.liquid` (26 CSS variables, RGB comma values). `css-variables.liquid` maps to `tailwind.input.css` (27 Tailwind tokens + 2 compatibility aliases + 6 alpha-level variants). All downstream tailwind files consume via Tailwind tokens. Hardcoded opacity values moved from `css-variables.liquid` to `tailwind.input.css`. `--color-dialog-overlay` remains hardcoded (no global setting yet; wait for dialog/drawer settings group).
- Documented rules: Layer Rules (1–4) added to `docs/references/style-system/css-and-typography.md`. MCP tool routing rule added to `AGENTS.md` Agent behavior rules.
- Global color chain follow-up: `border-theme-border-soft` and `border-theme-border-strong` compatibility aliases exist in `tailwind.input.css` with `/* TODO: migrate ... then remove */` comments. Liquid business files still use `border-theme-border-soft` (50+ references). Migrate to semantic class names (e.g., `divider`) or numeric token names (`border-theme-border-20`) before merge/release.
- Global color chain follow-up: `border-theme-border-strong` references in Liquid files need migration or removal. `text-theme-icon` was removed from the global Token entry, but `snippets/social-icons.liquid` still references it. Migrate before merge/release.
- Global color alpha levels: established numeric system — 100 (default), 80, 40, 20. Applied to `--color-theme-border-*` and `--color-focus-*`. Sub-heading text uses `--color-theme-text-80`. Hardcoded in `tailwind.input.css`, not tied to global settings.
- Global color chain follow-up: feedback colors (success/warning/error/info) added to `css-variables.liquid` and `tailwind.input.css`. No downstream Tailwind utilities or business file usage yet. Build semantic utilities when needed.
- Token naming convention: background colors omit `-bg` suffix (e.g., `--color-badge` not `--color-badge-bg`); `foreground` → `text`. Established during color chain work, documented in `css-and-typography.md` Layer Rules.
- Intentional breaking refactors on this development branch: icon size tiers were globally redefined; `newsletter-overlay` alignment was changed from `text_alignment` to `text`; global `section_padding_top` / `section_padding_bottom` settings were replaced by `section_margin_top` / `section_margin_bottom`. Review storefront/editor behavior before merge/release, but do not restore the previous contracts by default.
- Validation note: `npm test` and `npm run build:tw` pass. `npm run lint` currently fails only at `prettier --check`; formatting has not been run and is not a blocker for pushing this development branch, but repository lint must pass before merge/release.

## Next Session Template

Fill in before ending a session if the user asks for next-session context. Each field:

- Current state: Color chain complete (settings → css-variables → tailwind.input → tailwind.*.css). Typography chain verified. Structural variables (radius, shadow, border-width, focus-ring-width/offset) next for Tailwind token mapping. Business file semantic class migration deferred.
- Objective: Complete CSS variable chain cleanup across all categories (color done, structural next). Eventually migrate Liquid business files from raw token names to semantic class names.
- Files changed: `snippets/css-variables.liquid`, `tailwind/tailwind.input.css`, `tailwind/tailwind.elements.css`, `tailwind/tailwind.components.css`, `tailwind/tailwind.snippets.css`, `docs/references/style-system/css-and-typography.md`, `AGENTS.md`, `docs/agent/context.md`
- User decisions: Alpha levels use numeric naming (100/80/40/20). Background tokens omit `-bg` suffix. Hardcoded opacity values belong in tailwind.input.css, not css-variables.liquid. Aliases use `/* TODO: migrate ... then remove */`. Business files should use semantic classes, not raw tokens.
- Checks run: None (no lint/test run this session)
- Known blockers: `border-theme-border-soft` and `border-theme-border-strong` in Liquid files need migration. `--color-dialog-overlay` hardcoded, waiting for dialog/drawer settings. Feedback colors have no downstream utilities yet.
- Next recommended prompt: Map structural variables (input/button/surface border-width, focus-ring-width/offset) to Tailwind tokens in tailwind.input.css, following the same Layer Rules.
