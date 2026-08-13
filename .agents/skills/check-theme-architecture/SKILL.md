---
name: check-theme-architecture
description: Validate Shopify theme architecture and static browser compatibility rules. Use when Liquid, JS, Alpine, cart, CSS compatibility, or WebKit guardrails change.
when_to_use: >
  Liquid sections, section schema, Alpine x-data, Components.register, ThemeEvents,
  ShopifyHttp, cart flows, DOM refresh, heading classes, or npm.cmd run lint:theme.
---

# Check Theme Architecture

Use this skill for repository-specific architecture validation. `AGENTS.md` is authoritative for the rules; this skill owns the deterministic lint script that catches common violations.

## Command

- Run theme architecture lint: `npm.cmd run lint:theme`
- Run strict Liquid output syntax guard: `npm.cmd run lint:liquid-syntax`
- Run static browser compatibility lint: `npm.cmd run lint:compat`
- Rebuild Tailwind and scan compatibility: `npm.cmd run scan:compat`
- Aggregate gate that includes theme architecture lint: `npm.cmd run lint`

`npm.cmd run lint:theme` uses these skill resources:

```text
.agents/skills/check-theme-architecture/scripts/lint-liquid-syntax.js
.agents/skills/check-theme-architecture/scripts/lint-theme.js
.agents/skills/check-theme-architecture/scripts/lint-embedded-compat.cjs
.agents/skills/check-theme-architecture/scripts/lib/liquid-ast.js
```

## Selection Rules

1. Run `npm.cmd run lint:theme` after Liquid, schema, theme JavaScript, Alpine, HTTP/cart, section refresh, heading typography, or project WebKit guardrail changes.
2. Run `npm.cmd run lint:compat` after first-party CSS, JavaScript, or embedded Liquid stylesheet/javascript changes. Use `scan:compat` when Tailwind source changed.
3. Treat failures in touched code as blockers unless the user explicitly scopes them out.
4. Use `docs/references/patterns/canonical-*.md` only when implementation guidance is needed; do not bulk-load all examples for lint-only work.
5. Do not auto-fix merchant-owned configuration or content while resolving lint failures.

## Reporting

Report failures by file, line, and rule family. If a finding is pre-existing, say so and classify it as a warning or follow-up according to `AGENTS.md`.
