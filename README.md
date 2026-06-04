# My Skeleton Theme

This Shopify theme is based on the [Skeleton](http://getskeleton.com/) framework.

Primary project rules and implementation guidance live in [AGENTS.md](AGENTS.md).

---

## Repository Setup

From PowerShell, enter the project directory with:

```powershell
cd <project-path>
```

From Command Prompt, use `/d` when switching drives:

```cmd
cd /d <project-path>
```

Replace `<project-path>` with the directory where you cloned this repository.

This repository uses Git symlinks for agent adapter files:

- `CLAUDE.md -> AGENTS.md`
- `.claude\skills -> ..\.agents\skills`

On Windows, symlinks require NTFS/ReFS plus either Developer Mode, Administrator privileges, or the `Create symbolic links` user right. For a fresh clone, prefer enabling symlink checkout explicitly:

```bash
git clone -c core.symlinks=true <repo-url>
```

After cloning, verify the links from the repository root:

```powershell
Get-Item CLAUDE.md
Get-Item .claude\skills
git ls-files -s CLAUDE.md .claude/skills
```

Expected: `Get-Item` reports `LinkType: SymbolicLink`, and `git ls-files -s` reports mode `120000` for both paths.

If the links checkout as plain text files, enable Developer Mode or open the terminal as Administrator, then recreate them from the repository root. In PowerShell:

```powershell
cmd /c mklink CLAUDE.md AGENTS.md
cmd /c mklink /D .claude\skills ..\.agents\skills
```

In Command Prompt:

```cmd
mklink CLAUDE.md AGENTS.md
mklink /D .claude\skills ..\.agents\skills
```

Do not copy rule or skill files into adapter paths. `AGENTS.md` and `.agents\skills` remain the source files; `CLAUDE.md` and `.claude\skills` are only compatibility links for tools that expect Claude-style entry points.

---

## Third-Party Libraries

| Library       | Version | File(s)                                         | CDN / Source                                                                                                                           |
| ------------- | ------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Alpine.js     | v3.15.3 | `vendor-alpine.min.js`                          | [jsDelivr](https://cdn.jsdelivr.net/npm/alpinejs@3.15.3/dist/cdn.min.js)                                                               |
| Intersect.js  | v3.x.x  | `vendor-alpine-intersect.min.js`                | [jsDelivr](https://cdn.jsdelivr.net/npm/@alpinejs/intersect@3.x.x/dist/cdn.min.js)                                                     |
| Swiper        | v12.0.3 | `vendor-swiper.min.js`, `vendor-swiper.min.css` | [CSS](https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css), [JS](https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js) |
| GSAP          | v3.14.1 | `vendor-gsap.min.js`                            | [jsDelivr](https://cdn.jsdelivr.net/npm/gsap@3.14.1/dist/gsap.min.js)                                                                  |
| ScrollTrigger | v3.14.1 | `vendor-gsap-scrolltrigger.min.js`              | [jsDelivr](https://cdn.jsdelivr.net/npm/gsap@3.14.1/dist/ScrollTrigger.min.js)                                                         |

> Always update this table when replacing or upgrading a library.

---

## Build Commands

```bash
npm run dev        # shopify theme dev + tailwind watch
npm run build:tw   # production CSS build
npm run watch:tw   # CSS watch mode
npm run build:svg  # optimize SVG icons (icons/ -> assets/)
npm run lint       # CSS, i18n, theme architecture, and format checks
npm test           # shopify theme check
```

---

## Documentation

| Document                                                                               | Purpose                                                 |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [AGENTS.md](AGENTS.md)                                                                 | Canonical repository rules and architecture constraints |
| [WORKFLOW.md](WORKFLOW.md)                                                             | Shared agent workflow and handoff protocol              |
| [docs/README.md](docs/README.md)                                                       | Agent-readable docs and references index                |
| [docs/agent/README.md](docs/agent/README.md)                                           | Current agent context index                             |
| [.agents/skills/code-review/SKILL.md](.agents/skills/code-review/SKILL.md)             | Shared code review skill                                |
| [.agents/skills/run-shopify-theme/SKILL.md](.agents/skills/run-shopify-theme/SKILL.md) | Validation command dispatcher                           |
