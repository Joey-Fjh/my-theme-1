# Ceylune Shopify Theme

Ceylune is a custom Shopify Online Store 2.0 theme built with Liquid, Tailwind CSS v4, Alpine.js, and a lifecycle-aware JavaScript runtime. The repository is maintained as a Shopify Theme Store candidate.

Project rules and implementation constraints live in [AGENTS.md](AGENTS.md). Identity, migration status, and skeleton deviations: [docs/project.md](docs/project.md).

## Requirements

- Node.js 22+
- npm
- Shopify CLI
- Access to a Shopify development store

## Setup

First install:

```powershell
npm.cmd ci
```

First connect to a store (or use the `[environments.development]` entry in local `shopify.theme.toml`):

```powershell
npm.cmd run shopify:dev -- --store <store>.myshopify.com
```

After the local CLI store link exists, start development with:

```powershell
npm.cmd run dev
```

This repository tracks two classes of client adapters. Neither class may be replaced with copied content.

**Entry adapters (must remain symlinks):**

- `CLAUDE.md -> AGENTS.md`
- `.claude/skills -> ../.agents/skills`

**Role adapters (must remain separate real files):**

- `.claude/agents/{implementer,verifier}.md`
- `.cursor/agents/{implementer,verifier}.md`
- `.codex/agents/{implementer,verifier}.toml`

These six files are per-client permission shims, not duplicates of `.agents/roles/`. Do not symlink them to the canonical roles or merge them across clients.

### Clone on a symlink-capable environment

```powershell
git clone -c core.symlinks=true <repo-url>
```

### Windows repair when adapters materialised as plain files

If `CLAUDE.md` or `.claude/skills` appear as plain files containing only their target paths, repair from an elevated PowerShell:

```powershell
git config core.symlinks true
Remove-Item CLAUDE.md, .claude\skills -Force
git checkout -- CLAUDE.md .claude/skills
```

### Verify the entry adapters

```powershell
npm.cmd run doctor:agent
Get-Item CLAUDE.md, .claude\skills | Select-Object Name, LinkType, Target
git ls-files -s CLAUDE.md .claude/skills
```

`doctor:agent` should exit 0 when both entry adapters are real symlinks. Tracked Git mode should be `120000`.

### MCP servers

Agents use Shopify Dev MCP and Context7 for documentation, and Chrome DevTools MCP (`chrome-devtools`) to drive a browser against `shopify theme dev`: console messages, network requests, script evaluation, and performance traces. It needs a local Chrome (stable channel) and starts it with `--isolated`, so every session begins with a clean profile and an empty cache. Each client keeps its own config: `.mcp.json` (Claude Code), `.cursor/mcp.json` (Cursor), and `.codex/config.toml` (Codex); `npm.cmd run doctor:agent` fails when their server lists differ.

A client loads MCP servers when a session starts, so restart it after a config change. Claude Code asks once to approve project servers from `.mcp.json`; Cursor may need the project servers switched on under Settings → MCP.

If an expected MCP is missing, check client configuration, project trust, client restart, Node/npm, and network before falling back to official documentation.

## Commands

```powershell
npm.cmd run dev                 # Shopify theme dev (-e development) and Tailwind watch
npm.cmd run shopify:dev         # Shopify theme dev only
npm.cmd run build:tw            # Rebuild generated Tailwind CSS
npm.cmd run watch:tw            # Watch Tailwind sources
npm.cmd run build:svg           # Regenerate assets/icon-*.svg from icons/
npm.cmd run lint                # Repository lint and format checks
npm.cmd run test:validators     # Project validator fixture tests
npm.cmd test                    # Validators, Liquid syntax guard, Theme Check
npm.cmd run test:theme-check    # Shopify Theme Check only
npm.cmd run doctor:agent        # Verify CLAUDE.md / .claude/skills symlinks and matching MCP lists
```

Use `npm.cmd` for project scripts in this Windows workspace. Default to the smallest relevant validation command while developing; run full `npm.cmd run lint` and `npm.cmd test` before PR, version/release, or Theme Store submission, or when explicitly requested.

Generated and vendor assets must not be edited manually. See `AGENTS.md` for source and validation rules.

## Runtime (current storefront — pre phase 3–4)

Until the runtime migration batch lands, the live theme still uses:

- `Components.register()`, `ThemeEvents`, `ShopifyHttp`, and `ShopifySectionRefresher` in `assets/`
- Alpine.js and vendored Swiper (carousel approach under review; see `docs/agent/board.md`)

Target architecture after migration is documented in [JavaScript runtime](docs/references/architecture/javascript-runtime.md).

## Documentation

- [AGENTS.md](AGENTS.md): canonical repository rules and validation commands
- [docs/project.md](docs/project.md): identity, migration, and skeleton deviations
- [docs/agent/context.md](docs/agent/context.md): plan under execution and status
- [docs/references/](docs/references/): on-demand architecture and review references
- [Launch gate](docs/references/code-review/launch-gate.md): review and release checks

## Repository Boundaries

- Do not edit `config/settings_data.json` or `templates/*.json` without explicit authorization.
- Do not manually edit generated Tailwind output, generated icons, or minified vendor assets.
- `shopify.theme.toml` is local-only (gitignored); do not commit store credentials.

## License

Derived from Shopify's Skeleton Theme terms; see [LICENSE.md](LICENSE.md). Vendored third-party files keep their own licenses.
