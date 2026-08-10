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
- GSAP + ScrollTrigger (optional choreography tools for complex narrative motion, not the default for ordinary section reveal)
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
- Cursor discovers `.agents/skills/` directly; do not add a duplicate `.cursor/skills/` tree or symlink.
- `.agents/roles/` and `.agents/contracts/` are the vendor-neutral sources for multi-agent roles and structured handoffs.
- Tool-specific agent definitions such as `.codex/agents/*.toml` and `.cursor/agents/*.md` are thin adapters to the canonical `.agents/` role files.
- Tool-specific entry points may use relative symlinks to source files or directories. Do not copy rule or skill files into adapter paths.
- Tool-specific configuration, including MCP, permissions, local settings, and hooks, belongs in tool-owned directories such as `.claude/`, `.codex/`, or `.cursor/`; it does not change the project skill source.
- `docs/` is the agent-readable knowledge layer. Read referenced docs only when the task needs them.
- `docs/references/agent-workflow/` defines collaboration standards, task routing, third-party skill governance, and cross-session context rules. Read the matching reference for non-trivial agent work.

Important paths:

- `.agents/skills/`: project skills
- `.agents/roles/`: portable multi-agent role contracts
- `.agents/contracts/`: task and result schemas
- `docs/references/`: long references, examples, checklists
- `docs/agent/`: short current-state and cross-session handoff
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

- Use Context7 MCP for Tailwind CSS documentation queries. Use Shopify Dev MCP for Shopify API, Liquid, and theme architecture queries. Do not guess framework behavior when MCP is available.
- Users do not need to manually specify skills. For non-trivial tasks, use `agent-router` first to choose skills, docs, and validation.
- Use `orchestrate-agents` only after `agent-router` selects it or the user explicitly requests delegation. Parallelize independent read-only work, keep one writer per shared worktree, and keep the primary agent responsible for decisions and user communication.
- Delegated agents receive bounded task capsules and return structured evidence. They must not receive full conversation history by default, approve their own work, or create more agents; nested delegation is not supported by the initial contract.
- Where the active client supports lifecycle hooks, validate delegated results against `.agents/contracts/result.schema.json` before accepting them. Permit one format-only correction attempt, then report the delegated task as blocked if its result remains invalid.
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
- `motion_enabled` / `body[data-motion-enabled='false']` is the merchant-facing page and brand motion gate for reveal, media reveal, scroll, and narrative motion. Do not use it as a blanket kill switch for hover, focus, dropdown, dialog, drawer, loading, or other state/micro interactions; those interactions must instead respect `prefers-reduced-motion`.
- Tailwind utility classes first; no ad-hoc `<style>` blocks in Liquid templates.
- Do not use Tailwind text-size utilities for headings; use project typography tiers.
- User-visible strings, schema labels, ARIA copy, placeholders, and editor text must use locale keys.
- Use semantic interactive elements, keyboard access, visible focus, accessible names, and minimal ARIA.

Generated/vendor file rules:

- Never edit `vendor-*.min.js` or `vendor-*.min.css`.
- Never manually edit `assets/tailwind.output.css`.
- Never manually edit `assets/icon-*.svg`; regenerate from `icons/` with `npm.cmd run build:svg`.
- Never paste raw SVG into Liquid; render through the `icons` snippet.

---

## Task Routing

Read only the matching reference for the current task:

- JS runtime, lifecycle, events, HTTP, SectionRefresher, Alpine stores/components, Swiper, GSAP setup: `docs/references/architecture/javascript-runtime.md`
- Motion policy, choreography, reduced motion, animation ownership, duplication: `docs/references/architecture/motion-architecture.md`
- Shared abstraction boundaries and whether to extend an existing utility/component: `docs/references/architecture/abstraction-boundaries.md`
- CSS layer ownership, token/bridge contract, placement audits: `docs/references/style-system/css-architecture.md`
- Image snippet display behavior and `image.liquid` mode/fit contract: `docs/references/style-system/image-display-contract.md`
- Style-system index and build commands: `docs/references/style-system/css-and-typography.md`
- Typography tiers and consumption rules: `docs/references/style-system/typography-reference.md`
- Color, surface, inline style, z-index, and ownership rules: `docs/references/style-system/color-surface-reference.md`
- SVG icon pipeline: `docs/references/style-system/svg-icon-pipeline.md`
- Section lifecycle, Alpine, events, HTTP refresh, cart, Swiper, GSAP, motion transitions, CSS layering, accessibility examples: `docs/references/patterns/`
- i18n keys, locale structure, schema translation, hardcoded copy review: `docs/references/code-review/i18n-checklist.md`
- Shopify browser matrix, Tailwind build boundary, static compatibility checks, progressive enhancement, and WebKit guardrails: `docs/references/code-review/browser-compatibility.md`
- Launch readiness, Lighthouse classification, accessibility details, rule coverage, cleanup safety, repo safety, pre-merge self-check: `docs/references/code-review/launch-gate.md`
- General pre-merge review checklist: `docs/references/code-review/pre-merge.md`
- Daily collaboration standard, non-trivial task definition, user overrides, and complex task framing: `docs/references/agent-workflow/collaboration-standard.md`
- Skill/docs routing: `docs/references/agent-workflow/skill-routing.md`. Third-party adoption history: `docs/references/agent-workflow/external-skills.md`
- Multi-agent context isolation, role boundaries, task/result contracts, concurrency, and vendor adapters: `docs/references/agent-workflow/multi-agent-architecture.md`

Use `agent-router` for broad, ambiguous, multi-step, cleanup, Lighthouse, architecture, rule-setting, third-party skill, governance, or cross-session work.

---

## Agent Skills

Project skills live in `.agents/skills/`.

- Use `agent-router` first for non-trivial tasks, broad requests, cross-session continuation, third-party skill evaluation, or when multiple skills/docs might apply.
- Use `orchestrate-agents` after routing when independent delegation materially improves context isolation, verification, or latency.
- User skill names are optional overrides. If the user states intent without naming a skill, `agent-router` chooses the route.
- Use the routed project skill for implementation, review, validation, i18n, architecture, or icon work.
- If automatic skill triggering is unavailable, follow `docs/references/agent-workflow/skill-routing.md` and manually open only the routed skill.
- Some project skills are adapted from external sources. See `docs/references/agent-workflow/external-skills.md` for adoption history. External skills must be reviewed and adapted before installation; they are not project rule sources until installed in `.agents/skills/`.

Do not create, install, or approve skills during ordinary theme work. Discuss skill changes only when the user explicitly asks or when `agent-router` classifies the task as skills/governance work.

---

## Validation Commands

Use the smallest command that proves the change. In this Windows PowerShell workspace, run scripts through `npm.cmd`.

```bash
npm.cmd run lint          # i18n, theme architecture, agent orchestration, and format checks
npm.cmd run lint:agents   # multi-agent skills, roles, contracts, hooks, and vendor adapters
npm.cmd run test:agent-hooks # runtime result-schema hook acceptance and rejection cases
npm.cmd run lint:theme    # Liquid, JS architecture, Alpine, HTTP/cart, heading rules
npm.cmd run lint:i18n     # locale keys, translated strings, schema copy, ARIA copy
npm.cmd run lint:compat   # CSS, JS, and embedded Liquid browser compatibility checks
npm.cmd run scan:compat   # rebuild Tailwind output, then run compatibility checks
npm.cmd test              # Shopify Theme Check
npm.cmd run build:tw      # rebuild Tailwind output after Tailwind source changes
npm.cmd run build:svg     # regenerate SVG assets after icons/ changes
npm.cmd run dev           # Shopify theme dev + Tailwind watch
```

Run `npm.cmd run lint` and `npm.cmd test` after meaningful theme changes. Run `npm.cmd run scan:compat` after Tailwind source changes; it rebuilds `assets/tailwind.output.css` before the compatibility scan. Use `npm.cmd run build:tw` only for intermediate Tailwind iteration. Run `npm.cmd run build:svg` only when `icons/` source changed. Do not run rewriting formatters unless the user asks.

---

## Gotchas

- Shopify theme assets are flat under `assets/`; do not create nested runtime asset directories.
- Do not code-fix Lighthouse findings until code ownership is clear.
- Browserslist config drives static compatibility checks, not Tailwind v4's build target. Do not add Vite, Autoprefixer, or broad polyfills without an explicit architecture decision.
- Do not extend shared abstractions by adding mode flags or branching parameters for divergent behavior. Read `docs/references/architecture/abstraction-boundaries.md`.
- Do not mix visual redesign, architecture cleanup, Lighthouse fixes, and configuration changes in one batch.
- Preserve schema IDs, block types, section types, preset names, template references, and storefront behavior during cleanup.
- `.shopifyignore`, `.gitignore`, and `.prettierignore` have different scopes. Read `docs/references/code-review/launch-gate.md` before changing ignore rules.
