# AI-Assisted Theme Skeleton Workflow

Use this workflow when extracting a reusable Shopify theme skeleton from this repository or when starting a new theme from the skeleton.

## Goal

The skeleton should provide a stable, agent-friendly foundation:

- Clear architecture rules in `AGENTS.md`
- Canonical examples in `skills/examples/`
- Review checklists in `skills/code-review/`
- Runtime abstractions for Alpine, components, events, HTTP, cart, section refresh, and motion
- Lint gates for the rules that are practical to automate
- A Lighthouse 95+ launch standard

## Extraction Layers

Keep these layers in the skeleton:

| Layer | Keep |
| --- | --- |
| Runtime | `assets/base.js`, `events.js`, `https.js`, Alpine component/store registries, `motion.js`, utilities |
| CSS system | `tailwind/`, `assets/base.css`, token flow, motion utilities |
| Snippet primitives | icons pipeline, buttons, fields, dialogs, motion transitions, accessibility helpers |
| Agent docs | `AGENTS.md`, `skills/examples/`, `skills/code-review/` |
| Tooling | lint scripts, i18n lint, theme architecture lint, stylelint, prettier, SVG build |

Remove or replace brand-specific layers:

- Brand copy and merchant content
- Product-specific imagery
- Campaign-specific sections
- One-off layout sections that do not belong in a base starter
- Store-specific settings defaults

## New Theme Start Flow

1. Copy the skeleton.
2. Set store identity, colors, typography, social links, and locale baseline.
3. Define the content model: required templates, sections, snippets, and product metafields.
4. Build only from canonical patterns unless a new pattern is justified.
5. Run `npm run lint` after each rule-family change.
6. Run Lighthouse against core pages before launch.

## Agent Change Flow

Before editing:

1. Read `AGENTS.md`.
2. Check the matching file in `skills/examples/`.
3. Classify the change by rule family: JS lifecycle, Alpine, HTTP/cart, DOM refresh, CSS, motion, i18n, accessibility, SEO, icons.

While editing:

1. Prefer existing runtime abstractions.
2. Keep changes scoped to one rule family or feature.
3. Add tooling coverage when the same rule is likely to regress.

Before handoff:

1. Run the smallest relevant check.
2. Run `npm run lint` for production-bound work.
3. Report blockers, warnings, post-launch debt, and any command not run.

## Skeleton Acceptance Criteria

A skeleton version is acceptable when:

- `npm run lint` passes.
- `npm run build:tw` passes.
- Core runtime flows work without console errors.
- New sections can be built from examples without inventing a new architecture.
- Lighthouse can reach 95+ in all categories on representative pages after real content is added.
- Remaining legacy debt is listed in `skills/code-review/rule-coverage.md`.
