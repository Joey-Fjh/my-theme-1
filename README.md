# Ceylune Shopify Theme

Ceylune is a custom Shopify Online Store 2.0 theme built with Liquid, Tailwind CSS v4, Alpine.js, and a lifecycle-aware JavaScript runtime. The repository is maintained as a Shopify Theme Store candidate.

Project rules and implementation constraints live in [AGENTS.md](AGENTS.md). Identity, scope, and status: [docs/project.md](docs/project.md).

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

### Preapproved validators

The read-only validators listed under `preapproved` in `.agents/tools/harness/routes.json` run without a permission prompt. None writes to the repository; `test:harness` and `test:merchant` create temporary Git repositories in the system temp directory and delete them. Builds, formatters, `shopify` commands and `test:layout` always prompt. A preapproval must match the exact command: several of these scripts write files when given an extra argument (for example `lint:theme -- --shrink-migration-baseline` rewrites a tracked baseline). `npm.cmd run test:harness` fails when the Claude Code list differs from `routes.json`, when a listed script (or a script it runs) builds, rewrites or calls `shopify`, or when a prefix-matching allowlist is committed for Cursor or Codex.

- **Claude Code:** `permissions.allow` in `.claude/settings.json`, one exact `npm.cmd run <script>` rule per script for each of the Bash and PowerShell tools ([permissions](https://code.claude.com/docs/en/permissions)).
- **Cursor and Codex:** no committed list. Cursor's `.cursor/permissions.json` `terminalAllowlist` ([permissions.json](https://cursor.com/docs/reference/permissions)) and Codex's `.codex/rules/` `prefix_rule` ([rules](https://learn.chatgpt.com/docs/agent-configuration/rules)) match by prefix, so they would also allow the writing arguments. The project rules still apply there through the hooks, and the verifier stays read-only through each client's agent file; the commands only prompt (in Codex's read-only sandbox, only the two tests, which write to the system temp directory).

## New theme repository setup

Do this once when a new GitHub repository is created from this code. The CI store (`ci-test`, loaded with Shopify's performance test CSV) and its Theme Access password are shared by every theme and are not set up again.

1. **Protect `main`.** In the repository on GitHub: Settings, Rules, Rulesets, New ruleset, Import a ruleset, and choose `.github/rulesets/main.json`. It requires a pull request and the `Lint`, `Theme Check` and `Lighthouse` checks (up to date), and blocks force pushes and deletion; repository admins may bypass it for pull requests only.
2. **Add the Actions secrets** (Settings, Secrets and variables, Actions) that `.github/workflows/lighthouse.yml` reads: `SHOP_STORE`, `SHOP_ACCESS_TOKEN` and `SHOP_PASSWORD`. Enter the values on GitHub only; never put them in a file.
3. **Run the `Lighthouse` workflow once by hand** (Actions, Lighthouse, Run workflow) to prove the secrets work. The button appears once the workflow file is on `main`.

`npm.cmd run doctor:agent` fails when a check the ruleset file requires is not the name of a workflow job, because such a merge would wait forever. It reads files only: it does not see the live ruleset or the secrets, so change the file and the live ruleset together.

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
npm.cmd run doctor:agent        # Verify CLAUDE.md / .claude/skills symlinks, matching MCP lists, ruleset checks against job names
npm.cmd run test:layout-harness # Layout-check fixture suite (Chrome required; no dev server)
npm.cmd run test:layout         # Storefront layout scan (Chrome + shopify:dev). Optional LAYOUT_INJECT_STYLE for local regression CSS probes.
```

Use `npm.cmd` for project scripts in this Windows workspace. Default to the smallest relevant validation command while developing; run full `npm.cmd run lint` and `npm.cmd test` before PR, version/release, or Theme Store submission, or when explicitly requested.

Generated and vendor assets must not be edited manually. See `AGENTS.md` for source and validation rules.

## Runtime

Theme code loads as ES modules through an import map (`snippets/scripts.liquid`, entry `base.js`). Components are Alpine.js modules mounted by `data-module-id`, loaded through the project's Alpine adapter; Swiper is vendored behind the `carousel-swiper.js` adapter. Details: [JavaScript runtime](docs/references/architecture/javascript-runtime.md). Styles: Tailwind CSS v4 plus section and snippet `{% stylesheet %}` blocks; see [CSS architecture](docs/references/style-system/css-architecture.md).

## Documentation

- [AGENTS.md](AGENTS.md): canonical repository rules and validation commands
- [docs/project.md](docs/project.md): identity, scope, and status
- [docs/agent/board.md](docs/agent/board.md): open discussion and pending decisions
- [docs/agent/context.md](docs/agent/context.md): plan under execution and status
- [docs/references/](docs/references/): on-demand architecture and review references
- [Launch gate](docs/references/code-review/launch-gate.md): review and release checks

## Repository Boundaries

- Do not edit `config/settings_data.json`, `templates/*.json` or `sections/*-group.json` without explicit authorization.
- Do not manually edit generated Tailwind output, generated icons, or minified vendor assets.
- `shopify.theme.toml` is local-only (gitignored); do not commit store credentials.

## License

Derived from Shopify's Skeleton Theme terms; see [LICENSE.md](LICENSE.md). Vendored third-party files keep their own licenses.
