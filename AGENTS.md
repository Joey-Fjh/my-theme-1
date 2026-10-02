# Agent Entry Guide

This file is the always-on entry point and the canonical rule source for agents working in this repository. It holds only rules shared by every theme built from this codebase; keep it lean. **Before any task, read `docs/project.md`** for this repository's identity, inventory boundary, and accepted scope. Supporting docs under `docs/references/` provide details; if one conflicts with this file, follow this file.

## Tech Stack

- Shopify Liquid sections, snippets, JSON templates, and locale files
- Tailwind CSS v4 with CSS-based config and `@theme inline`
- Alpine.js v3 for reactive UI state
- GSAP + ScrollTrigger (optional, for complex narrative motion only)
- Swiper as the selected carousel library
- Custom runtime: import-map module graph, HTTP/section-refresh helpers, and the Alpine adapter (`define`, `holdUntilReady`, `mount`, `releaseHold`, `unmount`, `store`, `data`). See `docs/references/architecture/javascript-runtime.md`.

Runtime constraints:

- No bundler. `layout/theme.liquid` renders `snippets/scripts.liquid`, which loads theme code as ES modules through an import map (entry `base.js`). Only the vendored Alpine script is a classic `defer` script, and it runs after the entry. Load order: `docs/references/architecture/javascript-runtime.md`.
- Do not introduce React, Vue, TypeScript, or nested runtime asset structures unless the user explicitly approves an architecture change. Theme assets stay flat under `assets/`.
- Do not add Vite, Autoprefixer, or broad polyfills without an explicit architecture decision. Browserslist drives static compatibility checks only, not Tailwind v4's build target.

Third-party libraries are vendored files behind project adapters, not npm runtime packages. A selected library is vendored only when an accepted consumer exists. Every vendored library has an entry in `THIRD_PARTY_NOTICES.md`, updated in the same change that adds, replaces, or upgrades it.

## Agent Adapters

- `.agents/skills/` is the single source of project skills and `.agents/roles/` holds the canonical Implementer and Verifier roles. `CLAUDE.md` and `.claude/skills` are symlinks to them; Cursor reads `.agents/skills/` directly, so do not add `.cursor/skills/`.
- The six files under `.claude/agents/`, `.cursor/agents/`, and `.codex/agents/` are per-client permission shims, not duplicates of the roles. Do not symlink them to the roles or merge them across clients.
- Tool-specific configuration stays in `.claude/`, `.codex/`, or `.cursor/`. Never copy rule or skill files into adapter paths. If an adapter appears as a plain file, that is a local setup problem: run `npm.cmd run doctor:agent` and follow `README.md`.

## Core Rules

Launch stability, accessibility, SEO, maintainability, merchant configurability, and mobile reliability outrank visual novelty and Lighthouse micro-optimizations.

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
- `sections/*-group.json` (section groups the theme editor writes)
- color scheme values
- product, collection, page, article, blog, metafield, uploaded media, merchant copy, and navigation/content composition

Classify ambiguous issues before fixing them. If an issue could be code, configuration, content, uploaded asset, Shopify platform/vendor, or measurement noise, do not guess. Lighthouse findings are code-fixed only after code ownership is clear.

### Authority

- `docs/project.md` defines this repository's identity, inventory boundary, and accepted scope. Shopify best practices govern how retained code and approved additions are implemented.
- Theme Store submission completeness is a gate only when the user scopes a batch or theme to submission; adopting its accessibility and browser baselines does not import its feature inventory. Shopify Horizon is a reference for organization only (section and block structure): do not copy its code or features. Storefront features and review standards come only from Shopify's official documentation via Shopify Dev MCP.
- Project additions require an explicit accepted decision.
- The agent rules (`AGENTS.md`, `docs/project.md`, `docs/references/`, `.agents/`, and the client adapters) and the validator wiring (`package.json` scripts and `.github/workflows/ci.yml`) are the harness that constrains agents, and the user owns them. Agents propose rule changes and wait for explicit approval; they never add, strengthen, weaken, or move a rule on their own. When a mistake recurs, propose a computational check (lint, test, or hook) before adding prose.
- In this repository, **Platform Required** means a Shopify platform constraint necessary for a valid theme or for an already retained capability. It does not mean every feature required for Theme Store submission.
- Keep one writer per shared worktree.
- Do not retain code merely because it already exists.
- The files under `docs/references/` cite paths and symbol names, never line numbers, and `lint:doc-paths` fails when a cited path is missing. They describe what exists; they are evidence, not authority over what should be built. Architecture is decided from Shopify's current official sources and the user's stated intent; references are rewritten to match accepted decisions.

Hard implementation rules:

- Do not write inline executable `<script>` tags or bare global DOM listeners in Liquid. Data-only blocks with `type="importmap"` or `type="application/ld+json"` are allowed.
- Pass Liquid-driven runtime values to JavaScript through `data-*`.
- Keep Alpine attributes to simple expressions (method calls, state reads, binding objects or ternaries); put logic in the registered component. `lint:theme` enforces this.
- Critical first-viewport content must render usable and visible without JavaScript or animation completion.
- User-visible strings, schema labels, ARIA copy, placeholders, and editor text must use locale keys.
- Use semantic interactive elements, keyboard access, visible focus, accessible names, and minimal ARIA.
- Do not manually edit vendor, generated, or optimized icon assets.

## Batch SOP

The coordinator (the agent the user is talking to) owns steps 1–6 unless execution is delegated. Delegation does not transfer execution authority; one-writer and independent-review rules still apply.

The coordinator does not spawn subagents on its own, because each one rebuilds context and multiplies token use. When a step would benefit from one (step 7 independent review, a broad read-only search, a large batch), propose the role, client, and model (default: inherit the main model) and wait for the user's decision.

| Step | Owner | Action | Stop condition |
| --- | --- | --- | --- |
| 1 | Coordinator | Read `docs/project.md` and `docs/agent/board.md`, then `docs/agent/context.md` if continuing work. Read `docs/references/` only when task routing or the plan requires it. | Facts gathered; no implementation yet. |
| 2 | Coordinator + user | Discuss on `board.md`. One decision at a time. Update the board when discussion produces a conclusion, disagreement, or new pending decision. Record evidence, alternatives, disagreements, and pending decisions. If the user asks for review, orientation, or a prompt only, do not implement unless they explicitly authorize implementation. | A single direction is ready for the user to accept or reject. |
| 3 | Coordinator | When the user accepts a direction, remove resolved discussion from the board and write the plan into `context.md` with outcome, dependencies, **implementation surface**, a **review tier** (below), and acceptance checks written as verifiable checks, not claims. | Plan recorded. **Recording is not authorization.** |
| 4 | User | Authorize the batch explicitly. Resolve every dependency listed in the plan first. | User grants execution authority for this batch only. |
| 5 | Implementer (coordinator or delegated `.agents/roles/implementer.md`) | Execute inside the surface, following the working method in `.agents/roles/implementer.md`. Validate and correct until checks pass or a genuine blocker needs user authority. Deliver an external execution prompt (template in `.agents/roles/implementer.md`) only when the user requests it or work must run in another session or client. **Delivering a prompt is not completion.** | Implementation matches acceptance checks or a documented blocker remains. |
| 6 | Implementer | Record progress, validation output, blockers, and material corrections in `context.md`, not only in chat. | `context.md` reflects current execution state. |
| 7 | Per the plan's review tier: Verifier for Ask (someone other than the implementer; `.agents/roles/verifier.md`, including its reviewer checklist), user for Show, coordinator for Ship (the validator output recorded at step 6 is the review) | Review the diff and evidence against the plan's acceptance checks. | Review findings recorded; defects returned to step 5 or accepted with evidence. |
| 8 | User | Browser pass and explicit acceptance when the plan requires runtime verification. | User accepts or requests another correction cycle. |
| 9 | Coordinator | Commit when the user asks. Migrate durable contracts to `AGENTS.md`, a reference, code, or configuration. **Clear `context.md`.** | Plan removed from `context.md`; git holds history. |

**Review tiers (set at step 3, applied at step 7):**

- **Ask** when any of these holds: the batch changes the agent rules or validator wiring listed under Authority; it deletes or renames a file, symbol, setting, class, event, or locale key; it changes Liquid markup or schema (any `.liquid` file under `layout/`, `sections/`, `snippets/`, `blocks/`, or `templates/`, outside its `{% stylesheet %}` block; or `config/settings_schema.json`) or any `assets/*.js`; or it ran from an external execution prompt. The coordinator hands the user a review prompt (template in `.agents/roles/verifier.md`) to run in a separate session, preferably another client or model. The batch is complete only when that review reports PASS.
- **Show** when no Ask trigger holds, for example changes limited to CSS (`tailwind/`, `assets/*.css`, `{% stylesheet %}` blocks), locale string values, or documents outside the agent rules: the coordinator runs the plan's validators and reports the diff and their output; the user's look is the review.
- **Ship** for record files and formatting-only changes: the validators are the review.
- The coordinator may raise a tier, never lower it below its triggers. The user may set any tier when authorizing.

**Record-layer checks (apply at steps 3, 6, and 9):**

- `docs/project.md` holds identity, scope, and overall status; `board.md` holds what has not yet become a plan; `context.md` holds **only the plan under execution and its status**. Unexecuted plans, queued plans, and plans waiting on work the agent could finish stay out of it. **One exception:** extra plans may coexist only when each is executed and waiting on verification the agent cannot perform (browser pass or human review), naming who verifies.
- While `context.md` holds a plan that is not fully executed and reviewed, do not start other work; finish it, or ask the user to drop it.
- A batch's acceptance boundary names its **implementation surface**. Changing the record files is never a scope violation.
- Chat history and commit messages are evidence, never a substitute for the current execution record.

**Sources:**

- Use Shopify Dev MCP for Shopify platform claims. Use Context7 for third-party library docs when current-version sources matter, resolving the library ID at call time. Do not guess framework behavior when the appropriate MCP should be available.
- If an expected MCP is missing, troubleshoot per `README.md` ("MCP servers") before falling back to the official website, and state that degraded source explicitly.

## Task Routing

Read only the matching reference for the current task:

- JS runtime, lifecycle, events, HTTP, SectionRefresher, `{% block %}` / `{% partial %}` adoption, Alpine stores/components, Swiper/GSAP adoption: `docs/references/architecture/javascript-runtime.md`
- Motion policy, choreography, reduced motion, animation ownership, duplication: `docs/references/architecture/motion-architecture.md`
- Shared abstraction boundaries, snippet parameter API, and whether to extend an existing utility/component: `docs/references/architecture/abstraction-boundaries.md`
- Section block composition (this theme uses section blocks, not skeleton Theme Blocks): `docs/project.md` (Deviations From The Skeleton)
- CSS layer ownership, typography tiers, color/surface rules, token/bridge contract, placement audits: `docs/references/style-system/css-architecture.md`
- Image snippet display behavior and `image.liquid` mode/fit contract: `docs/references/style-system/image-display-contract.md`
- i18n keys, locale structure, schema translation, hardcoded copy review: `docs/references/code-review/i18n-checklist.md`
- Shopify browser matrix, Tailwind build boundary, static compatibility checks, progressive enhancement, and WebKit guardrails: `docs/references/code-review/browser-compatibility.md`
- Launch readiness, Lighthouse ownership classification, cleanup safety, ignore-file boundaries, review output, and gate validation: `docs/references/code-review/launch-gate.md`
- Theme Store submission, or judging whether a theme's features are complete: no local copy; query the current official pages through Shopify Dev MCP — [requirements](https://shopify.dev/docs/storefronts/themes/store/requirements), [review stages](https://shopify.dev/docs/storefronts/themes/store/review-process/submit-theme), and [testing checklist](https://shopify.dev/docs/storefronts/themes/store/test-theme/checklist)

## Agent Skills

Project skills in `.agents/skills/`: the executable validators `check-i18n` and `check-theme-architecture`, and the vendored GreenSock documentation skills `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, and `gsap-performance` (MIT; agent documentation only, no storefront payload). Read the GSAP skills only after the motion reference classifies work as complex choreography. The vendored Anthropic skill `frontend-design` (Apache 2.0) is a design reference only: it ranks below Shopify's official sources and the project rules, is not read by default, and its suggestions are discussed with the user before adoption (`.agents/skills/frontend-design/UPSTREAM.md`).

Do not create, install, or approve skills during ordinary theme work. Discuss skill changes only when the user explicitly asks.

## Validation

Run scripts through `npm.cmd` in this Windows PowerShell workspace. Default to the smallest command that proves the change. Reserve `npm.cmd run lint` and `npm.cmd test` for explicit user request, PR, version/release, or Theme Store submission gates.

| Change surface | Commands |
| --- | --- |
| Liquid, schema, architecture guardrails | `npm.cmd run lint:theme` and/or `npm.cmd run test:theme-check` |
| Locales, translated strings, schema copy | `npm.cmd run lint:i18n` |
| `tailwind/**`, `assets/base.css`, `assets/gift-card.css` | `npm.cmd run scan:compat` + `npm.cmd run lint:theme` |
| `assets/*.js`, embedded Liquid blocks | `npm.cmd run lint:compat` + `npm.cmd run lint:theme` |
| Strict Liquid output parsing (filter-arg guard) | `npm.cmd run lint:liquid-syntax` |
| Agent rules, skills, roles, adapters, references | Link/syntax check on changed files + `npm.cmd run lint:doc-paths` + `npm.cmd run doctor:agent` |
| Release / PR / Theme Store gate | `npm.cmd run lint` and `npm.cmd run test` |

Build helpers: `npm.cmd run build:tw` (Tailwind iteration), `npm.cmd run build:svg` (staged icons in `icons/`). Do not run rewriting formatters unless the user asks.

## Gotchas

- `icons/` is intentionally Git-ignored and may not exist in a clean checkout. Create it only as temporary input for `npm.cmd run build:svg`; committed optimized icons live in `assets/`.
- Do not mix visual redesign, architecture cleanup, Lighthouse fixes, and configuration changes in one batch.
- Preserve schema IDs, block types, section types, preset names, template references, and storefront behavior during cleanup.
- `.shopifyignore`, `.gitignore`, and `.prettierignore` have different scopes. Read `docs/references/code-review/launch-gate.md` before changing ignore rules.
