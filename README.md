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

| Library      | Version | File(s)                                         | CDN / Source                                                                                                                           |
| ------------ | ------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Alpine.js    | v3.15.3 | `vendor-alpine.min.js`                          | [jsDelivr](https://cdn.jsdelivr.net/npm/alpinejs@3.15.3/dist/cdn.min.js)                                                               |
| Intersect.js | v3.x.x  | `vendor-alpine-intersect.min.js`                | [jsDelivr](https://cdn.jsdelivr.net/npm/@alpinejs/intersect@3.x.x/dist/cdn.min.js)                                                     |
| Swiper       | v12.0.3 | `vendor-swiper.min.js`, `vendor-swiper.min.css` | [CSS](https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css), [JS](https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js) |

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

---

## Windows Git Symlink 注意事项

本项目使用 Git 符号链接维护 Agent 入口文件，例如：

```txt
.claude/skills -> .agents/skills
CLAUDE.md -> AGENTS.md
```

Windows 环境下，拉取或切换分支时可能出现：

```txt
error: unable to create symlink .claude/skills: Permission denied
error: unable to create symlink CLAUDE.md: Permission denied
```

这是因为当前终端没有创建符号链接的权限。

### 首次配置

建议在 Windows 上先开启 Git symlink 支持：

```cmd
git config --global core.symlinks true
```

确认配置：

```cmd
git config --global --get core.symlinks
```

应返回：

```txt
true
```

### 拉取代码推荐方式

首次 clone / pull / checkout 涉及 symlink 的分支时，建议使用以下任一方式：

1. 使用“管理员身份运行”的 CMD / PowerShell；
2. 或开启 Windows 开发者模式后，重新打开终端；
3. 或以管理员身份启动 VSCode，再使用 VSCode 集成终端。

推荐命令：

```cmd
cd /d D:\path\to\project
git config --local core.symlinks true
git pull --ff-only
```

### 已经出现 symlink 权限错误时

先确认当前是否有自己的本地改动：

```cmd
git status -sb
```

如果只是 pull 失败产生的残留文件，可以清理后重新拉取：

```cmd
git clean -fd
git config --local core.symlinks true
git pull --ff-only
```

如果需要彻底同步远端 main：

```cmd
git fetch origin
git reset --hard origin/main
git clean -fd
```

注意：`git clean -fd` 会删除本地未追踪文件，执行前需要确认这些文件不是自己新建但尚未提交的代码。
