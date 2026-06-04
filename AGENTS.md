# Agent Entry Guide

This file is the always-on entry point for agents working in this repository. Keep it lean: project identity, hard rules, routing, skills, validation commands, and gotchas only.

`AGENTS.md` is the canonical repository rule source. Supporting docs under `docs/references/` provide details and examples. If a supporting doc conflicts with this file, follow this file.

---

## Project Context

This is a custom Shopify theme maintained as a multi-industry, sellable Shopify Theme Store candidate.

Tech stack:

- Shopify Liquid sections, snippets, JSON templates, and locale files
- Tailwind CSS v4 with CSS-based config and `@theme inline`
- Alpine.js v3 for reactive UI state
- GSAP + ScrollTrigger for choreography
- Swiper for carousels
- Custom runtime: `Components.register()`, `ThemeEvents`, `ShopifyHttp`, `ShopifySectionRefresher`
  See `docs/references/architecture/javascript-runtime.md` for API details and usage patterns.

Runtime constraints:

- No bundler is used.
- Scripts load via `defer` in `layout/theme.liquid`.
- Do not introduce React, Vue, TypeScript, ESM imports, or nested runtime asset structures unless the user explicitly approves an architecture change.

---

## Agent Entry Points

- `AGENTS.md` is the source entry file. `CLAUDE.md` is a symlink adapter to `AGENTS.md`.
- `.agents/skills/` is the single source of truth for project skills. `.claude/skills/` is a symlink adapter to `../.agents/skills`.
- Tool-specific entry points may use relative symlinks to source files or directories. Do not copy rule or skill files into adapter paths.
- Tool-specific configuration, including MCP, permissions, local settings, and hooks, belongs in tool-owned directories such as `.claude/` or `.codex/`; it does not change the project skill source.
- `docs/` is the agent-readable knowledge layer. Read referenced docs only when the task needs them.
- `docs/references/agent-workflow/` defines collaboration standards, task routing, third-party skill governance, and cross-session context rules. Read the matching reference for non-trivial agent work.

Important paths:

- `.agents/skills/`: project skills
- `docs/references/`: long references, examples, checklists
- `docs/agent/`: agent context, next-session template
- `sections/`, `snippets/`, `assets/`, `tailwind/`, `locales/`: theme implementation
- `config/settings_data.json` and `templates/*.json`: merchant-owned configuration

---

## Core Rules

Launch stability, Shopify Theme Store readiness, accessibility, SEO, maintainability, merchant configurability, and mobile reliability outrank visual novelty and Lighthouse micro-optimizations.

Treat these as launch blockers unless the user explicitly scopes them out:

- Theme Check errors
- Repository lint or test failures
- Accessibility regressions in user-facing controls, navigation, forms, dialogs, drawers, filters, search, cart, product media, or checkout-adjacent flows
- SEO regressions caused by theme code
- Broken mobile layouts or mobile-only interaction failures
- Manual edits to generated or vendor files
- Changes to merchant-owned configuration or content without explicit approval

Do not modify merchant-owned configuration or content unless explicitly authorized:

- `config/settings_data.json`
- `templates/*.json`
- color scheme values
- product, collection, page, article, blog, metafield, uploaded media, merchant copy, and navigation/content composition

Classify ambiguous issues before fixing them. If an issue could be code, configuration, content, uploaded asset, Shopify platform/vendor, or measurement noise, do not guess.

Agent behavior rules:

- Users do not need to manually specify skills. For non-trivial tasks, use `agent-router` first to choose skills, docs, and validation.
- For complex, risky, cross-session, or broad cleanup work, classify purpose, ownership, risk, and allowed action before editing.
- If the user asks for review, orientation, or a prompt, do not refactor or implement unless they explicitly ask for implementation.
- Facts discoverable from the repository must be inspected before asking the user. Ask before editing when the unknown is merchant-owned configuration, product/design preference, architecture direction, or launch-risk tradeoff.
- Persist durable decisions and cross-session notes in `docs/agent/context.md` or the matching docs reference, not only in chat.
- When the user asks to continue previous work, review outstanding tasks, or prepare next-session context, read `docs/agent/context.md`.

Hard implementation rules:

- Do not write inline `<script>` tags or bare global DOM listeners in Liquid.
- JS behavior needing lifecycle management must use `Components.register()` inside `{%- javascript -%}`.
- Reusable Alpine behavior must be registered via `AlpineComponentsFactory.register()` in the appropriate `alpine.components.*.js` file.
- Pass Liquid-driven runtime values through `data-*`; do not embed complex Liquid, JSON, or quote-heavy values directly in `x-data`.
- Cross-section/component communication must use `ThemeEvents`.
- Application HTTP must use `window.ShopifyHttp`; raw `fetch()` belongs only in `assets/https.js` or vendor files.
- Shopify section HTML replacement must use `window.ShopifySectionRefresher.render()`.
- Storefront cart mutations and cart UI state must go through `$store.cart`.
- Above-the-fold critical content must render usable and visible without JavaScript or animation completion. Do not hide critical first-viewport content behind GSAP, Alpine, Swiper initialization, delayed transitions, `opacity-0`, `hidden`, `x-show="false"`, off-screen transforms, or callbacks.
- Tailwind utility classes first; no ad-hoc `<style>` blocks in Liquid templates.
- Do not use Tailwind text-size utilities for headings; use project typography tiers.
- User-visible strings, schema labels, ARIA copy, placeholders, and editor text must use locale keys.
- Use semantic interactive elements, keyboard access, visible focus, accessible names, and minimal ARIA.

Generated/vendor file rules:

- Never edit `vendor-*.min.js` or `vendor-*.min.css`.
- Never manually edit `assets/tailwind.output.css`.
- Never manually edit `assets/icon-*.svg`; regenerate from `icons/` with `npm run build:svg`.
- Never paste raw SVG into Liquid; render through the `icons` snippet.

---

## Task Routing

Read only the matching reference for the current task:

- JS runtime, lifecycle, events, HTTP, SectionRefresher, Alpine stores/components, Swiper, GSAP setup: `docs/references/architecture/javascript-runtime.md`
- Motion policy, choreography, reduced motion, animation ownership, duplication: `docs/references/architecture/motion-architecture.md`
- Shared abstraction boundaries and whether to extend an existing utility/component: `docs/references/architecture/abstraction-boundaries.md`
- CSS layers, Tailwind, typography, color, inline styles, SVG icon pipeline: `docs/references/style-system/css-and-typography.md`
- Section lifecycle, Alpine, events, HTTP refresh, cart, Swiper, GSAP, motion transitions, CSS layering, accessibility examples: `docs/references/patterns/`
- i18n keys, locale structure, schema translation, hardcoded copy review: `docs/references/code-review/i18n-checklist.md`
- Launch readiness, Lighthouse classification, accessibility details, rule coverage, cleanup safety, repo safety, pre-merge self-check: `docs/references/code-review/launch-gate.md`
- General pre-merge review checklist: `docs/references/code-review/pre-merge.md`
- Daily collaboration standard, non-trivial task definition, user overrides, and complex task framing: `docs/references/agent-workflow/collaboration-standard.md`
- Skill/docs routing and third-party skill governance: `docs/references/agent-workflow/skill-routing.md` and `docs/references/agent-workflow/external-skills.md`

Use `agent-router` for broad, ambiguous, multi-step, cleanup, Lighthouse, architecture, rule-setting, third-party skill, governance, or cross-session work.

---

## Agent Skills

Project skills live in `.agents/skills/`.

- Use `agent-router` first for non-trivial tasks, broad requests, cross-session continuation, third-party skill evaluation, or when multiple skills/docs might apply.
- User skill names are optional overrides. If the user states intent without naming a skill, `agent-router` chooses the route.
- Use the routed project skill for implementation, review, validation, i18n, architecture, or icon work.
- If automatic skill triggering is unavailable, follow `docs/references/agent-workflow/skill-routing.md` and manually open only the routed skill.
- Third-party or official skills may inform work only through `docs/references/agent-workflow/external-skills.md`; they are not project rule sources unless adapted and approved.

Do not create, install, or approve skills during ordinary theme work. Discuss skill changes only when the user explicitly asks or when `agent-router` classifies the task as skills/governance work.

---

## Validation Commands

Use the smallest command that proves the change.

```bash
npm run lint          # i18n, theme architecture, and format checks
npm run lint:theme    # Liquid, JS architecture, Alpine, HTTP/cart, heading rules
npm run lint:i18n     # locale keys, translated strings, schema copy, ARIA copy
npm test              # Shopify Theme Check
npm run build:tw      # rebuild Tailwind output after Tailwind source changes
npm run build:svg     # regenerate SVG assets after icons/ changes
npm run dev           # Shopify theme dev + Tailwind watch
```

Run `npm run lint` and `npm test` after meaningful theme changes. Run `npm run build:tw` only when Tailwind source changed. Run `npm run build:svg` only when `icons/` source changed. Do not run rewriting formatters unless the user asks.

---

## Gotchas

- Shopify theme assets are flat under `assets/`; do not create nested runtime asset directories.
- Do not code-fix Lighthouse findings until code ownership is clear.
- Do not extend shared abstractions by adding mode flags or branching parameters for divergent behavior. Read `docs/references/architecture/abstraction-boundaries.md`.
- Do not mix visual redesign, architecture cleanup, Lighthouse fixes, and configuration changes in one batch.
- Preserve schema IDs, block types, section types, preset names, template references, and storefront behavior during cleanup.
- `.shopifyignore`, `.gitignore`, and `.prettierignore` have different scopes. Read `docs/references/code-review/launch-gate.md` before changing ignore rules.
- `.prettierignore` currently has unrelated local changes in this worktree; do not include or rewrite it unless explicitly asked.
