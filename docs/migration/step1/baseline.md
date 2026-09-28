# Phase 1 — Pre-change baseline (A0)

Recorded at commit `af05311600ceea26133a055abae062b9d2b3b800` on branch `refactor/skeleton-shell`, **before** stage A mechanical replacement.

Commands (old `package.json` / validator wiring):

```powershell
npm.cmd run test:theme-check
npm.cmd run lint:theme
npm.cmd run lint:i18n
```

## Summary

| Command | Result | Issue count |
|---------|--------|-------------|
| `test:theme-check` | Pass | **0** offenses (140 files inspected) |
| `lint:theme` | Pass | **0** |
| `lint:i18n` | Pass | **0** |

## Theme Check detail

No offenses; Shopify CLI reported success only. Raw capture: `docs/migration/step1/_theme-check.out`.

## `lint:theme` detail

Output: `theme architecture lint passed.` — see `docs/migration/step1/_lint-theme.out`.

## `lint:i18n` detail

Output: `i18n lint passed.` — see `docs/migration/step1/_lint-i18n.out`.
