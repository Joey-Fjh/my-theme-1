# Ceylune Shopify Theme

Ceylune is a custom Shopify Online Store 2.0 theme built with Liquid, Tailwind CSS v4, Alpine.js, and a small lifecycle-aware JavaScript runtime. The repository is maintained as a Shopify Theme Store candidate.

Project rules and implementation constraints live in [AGENTS.md](AGENTS.md).

## Setup

Requirements:

- Node.js and npm
- Shopify CLI
- Access to a Shopify development store

From the repository root:

```powershell
npm.cmd install
npm.cmd run dev
```

This repository tracks two symlink adapters:

- `CLAUDE.md -> AGENTS.md`
- `.claude/skills -> ../.agents/skills`

On Windows, enable Developer Mode or use an account allowed to create symbolic links before cloning. Prefer:

```powershell
git clone -c core.symlinks=true <repo-url>
```

Verify the adapters after cloning:

```powershell
Get-Item CLAUDE.md
Get-Item .claude\skills
git ls-files -s CLAUDE.md .claude/skills
```

The tracked entries should report Git mode `120000`. Do not copy rules or skills into adapter paths.

## Commands

```powershell
npm.cmd run dev          # Shopify theme dev and Tailwind watch
npm.cmd run build:tw     # Rebuild generated Tailwind CSS
npm.cmd run watch:tw     # Watch Tailwind sources
npm.cmd run build:svg    # Regenerate assets/icon-*.svg from icons/
npm.cmd run lint         # Repository lint and format checks
npm.cmd test             # Shopify Theme Check
```

Generated and vendor assets must not be edited manually. See `AGENTS.md` for the source and validation rules.

## Runtime

- Shopify Liquid sections, snippets, JSON templates, and locale files
- Tailwind CSS v4 with CSS-based configuration
- Alpine.js 3.15.3 and Alpine Intersect
- Swiper 12.1.2
- Project runtime: `Components.register()`, `ThemeEvents`, `ShopifyHttp`, and `ShopifySectionRefresher`
- Flat files under `assets/`; no bundler or ESM runtime

## Documentation

| Document                                                                 | Purpose                                       |
| ------------------------------------------------------------------------ | --------------------------------------------- |
| [AGENTS.md](AGENTS.md)                                                   | Canonical repository rules and task routing   |
| [docs/README.md](docs/README.md)                                         | Agent-readable documentation index            |
| [docs/agent/context.md](docs/agent/context.md)                           | Short current-state and cross-session handoff |
| [JavaScript runtime](docs/references/architecture/javascript-runtime.md) | Runtime APIs, lifecycle, and script order     |
| [Style-system index](docs/references/style-system/css-and-typography.md) | CSS sources, ownership, and build routing     |
| [Launch gate](docs/references/code-review/launch-gate.md)                | Review and release checks                     |

## Repository Boundaries

- Do not edit `config/settings_data.json` or `templates/*.json` without explicit authorization.
- Do not manually edit generated Tailwind output, generated icons, or minified vendor assets.
- Use `npm.cmd` for project scripts in this Windows workspace.
- Use the smallest relevant validation command while developing; run `npm.cmd run lint` and `npm.cmd test` after meaningful theme changes.
