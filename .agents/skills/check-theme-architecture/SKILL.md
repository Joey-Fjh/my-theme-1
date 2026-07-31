---
name: check-theme-architecture
description: Validate Shopify theme architecture rules with the custom lint. Use when Liquid, JS, Alpine, or cart code changes.
when_to_use: >
  Liquid sections, section schema, Alpine x-data, Components.register, ThemeEvents,
  ShopifyHttp, cart flows, DOM refresh, heading classes, or npm.cmd run lint:theme.
---

# Check Theme Architecture

Use this skill for repository-specific architecture validation. `AGENTS.md` is authoritative for the rules; this skill owns the deterministic lint script that catches common violations.

## Command

- Run theme architecture lint: `npm.cmd run lint:theme`
- Aggregate gate that includes theme architecture lint: `npm.cmd run lint`

`npm.cmd run lint:theme` uses these skill resources:

```text
.agents/skills/check-theme-architecture/scripts/lint-theme.js
.agents/skills/check-theme-architecture/scripts/lib/liquid-ast.js
```

## Selection Rules

1. Run `npm.cmd run lint:theme` after Liquid, schema, theme JavaScript, Alpine, HTTP/cart, section refresh, or heading typography changes.
2. Treat failures in touched code as blockers unless the user explicitly scopes them out.
3. Use `docs/references/patterns/canonical-*.md` only when implementation guidance is needed; do not bulk-load all examples for lint-only work.
4. Do not auto-fix merchant-owned configuration or content while resolving lint failures.

## Reporting

Report failures by file, line, and rule family. If a finding is pre-existing, say so and classify it as a warning or follow-up according to `AGENTS.md`.
