# Step 1：外层文件迁移对比报告（只读）

**对比基准**

| 仓库 | 分支/提交 | 说明 |
|------|-----------|------|
| `d:\fjh\shopify\my-theme-1` | `926dddb`（`refactor/skeleton-shell` = `main`） | Theme Store 业务主题 |
| `d:\fjh\shopify\my-skeleton-theme` | `e96aedd`（v1.0.0 母版） | 外层框架重建来源 |

**范围**：`git ls-files` 并排除 `sections/`、`snippets/`、`assets/`、`templates/`、`config/`、`locales/`。  
**本步不逐文件归类**：`layout/`、`tailwind/`、`icons/`、`blocks/`（仅概况见 §0）。

**本机**：`git config core.symlinks` → `true`（见 §必查项 7）。

---

## 1. 摘要

### 1.1 外层文件规模（`git ls-files` 过滤后）

| 指标 | 数量 |
|------|------|
| 两边路径交集 | 52 |
| 内容相同（`git hash-object` 一致） | 8 |
| 路径相同但内容不同 | 44 |
| 仅 my-theme-1 | 30 |
| 仅 skeleton | 34（含 `blocks/` 下 4 个 liquid） |

### 1.2 结论标签数量（人工归类，含目录合并行）

| 结论 | 约计 | 说明 |
|------|------|------|
| **S** | ~62 | 以 skeleton 为准整体迁入或覆盖 |
| **T** | ~3 | 保留 my-theme-1 独占或主题专属正文 |
| **M** | ~8 | 迁入 skeleton 后手工融合 |
| **D** | ~28 | 仅 my-theme-1 有、迁入 skeleton 体系后删除 |
| **?** | 5 | 见 §4 |

（`layout/`、`tailwind/` 共 9 个「不同」文件本表不单列，归后续批次；`blocks/` 4 文件见 §0 与 §必查项 2。）

### 1.3 最重要的 5 条发现

1. **运行时文档与代码脱节**：my-theme-1 的 `docs/references/architecture/javascript-runtime.md` 仍描述 `Components.register()` / `AlpineComponentsFactory`（如 `javascript-runtime.md:90–117`），而 skeleton 同路径文档描述 `alpine.adapter.js`、`cart.contract.js`、`data-module-id` 与 import map（`my-skeleton-theme` 同文件 `:14–21`、`:67`）。外层按 skeleton 覆盖后，在 JS 批次完成前 **规则与 `assets/` 长期不一致**。
2. **`package.json` 已部分「像 skeleton」但脚本体系仍属旧多 Agent 栈**：my-theme-1 的 `name` 已是 `"my-skeleton-theme"`（`package.json:2`），却仍含 `lint:agents` / `test:agent-hooks` 且依赖 `orchestrate-agents`（`package.json:9–10`、`33–37` 的 `ajv`）；skeleton 改为 `lint:doc-paths`、`doctor:agent`、`test:validators`，无 `ajv`（skeleton `package.json:10–30`、`39–55`）。
3. **Prettier 对商户 JSON 的处理**：skeleton 在 `.prettierrc` 用 `overrides` 为 `templates/**/*.json` 与 `config/settings_data.json` 设 `tabWidth: 2`（skeleton `.prettierrc:16–21`）；**两边 `.prettierignore` 均未排除这些路径**（内容一致，见 `my-theme-1/.prettierignore:1–22`）。迁入 skeleton 的 `.prettierrc` 会改变 JSON 格式化行为，但仍会参与 `prettier .`。
4. **不迁移 Theme Blocks 与 skeleton 文档/校验的冲突**：skeleton `AGENTS.md:117` 强制阅读 `docs/references/architecture/theme-blocks.md`；校验 glob 含 `blocks/**/*.liquid`（如 skeleton `lint-theme.js:28`）。my-theme-1 **无 `blocks/` 目录**（`git ls-files blocks/` → 0）。外层原样 checkout 后，`lint:doc-paths` 会因 `blocks/*.liquid`、`sections/custom-section.liquid` 等引用失败（§必查项 6）。
5. **`.gitignore` 对 `shopify.theme.toml` 分歧**：skeleton 忽略 `shopify.theme.toml`（skeleton `.gitignore:14`）；my-theme-1 **跟踪**该文件（`shopify.theme.toml` 仅在 only-T 列表）。若整文件采用 skeleton `.gitignore`，会改变 CLI 本地配置是否入库的策略（§必查项 3，标 **M**）。

---

## 0. 延后目录概况（本步不逐文件归类）

| 目录 | my-theme-1 文件数 | skeleton 文件数 | 差异概况 |
|------|-------------------|-----------------|----------|
| `layout/` | 2 | 2 | 路径相同，`theme.liquid` / `password.liquid` 内容不同（hash 对比）；skeleton 为 ESM import map + adapter 架构，my-theme-1 为 `defer` 脚本 + `Components.register()`（见 `layout/theme.liquid` 中 vendor 脚本，my-theme-1 `:24`、`:63–64`）。**后续 layout 批次，本步不 checkout。** |
| `tailwind/` | 7 | 6 | skeleton 无 `tailwind/tailwind.snippets.css`（仅 my-theme-1）；其余 6 个文件名相同但内容均不同。**后续 tailwind 批次。** |
| `icons/` | 0 | 0 | 两边 `git ls-files icons/` 均为 0（`.gitignore` 忽略 `icons/*`，见 `.gitignore:19–21`）。 |
| `blocks/` | 0 | 4 | skeleton 含 `button`/`group`/`heading`/`text` 四个 theme block；my-theme-1 决定不迁移。**不要** `git checkout skeleton -- blocks/`；需同步处理 `theme-blocks.md` 与 AGENTS 路由（§必查项 2、§4）。 |

---

## 2. 逐文件表

**状态列**：仅 T = 只在 my-theme-1；仅 S = 只在 skeleton；相同 = 两边都有且 blob 相同；不同 = 两边都有且 blob 不同。

### 2.1 内容相同（可跳过或一次性确认）

| 路径 | 状态 | 结论 | 理由 |
|------|------|------|------|
| `.agents/skills/check-theme-architecture/scripts/lib/liquid-ast.js` | 相同 | S* | 与 skeleton 一致；随 skeleton `check-theme-architecture` 目录 checkout 会保持。 |
| `.claude/skills` | 相同 | S | 均为 symlink `../.agents/skills`（`git ls-files -s` 模式 `120000`）。 |
| `.cursor/mcp.json`、`.editorconfig`、`.mcp.json`、`.prettierignore`、`.vscode/settings.json`、`stylelint.config.cjs` | 相同 | S | blob 一致；随 skeleton 外层迁入无实质变化。 |

\*若只 checkout 变更文件，此文件可不动。

### 2.2 仅 skeleton（迁入）

| 路径 | 状态 | 结论 | 理由 |
|------|------|------|------|
| `.agents/skills/check-i18n/scripts/lint-i18n-unused.js`、`*-unused.test.js`、`lint-i18n.test.js` | 仅 S | S | skeleton 增强 i18n 校验与测试（`package.json` `lint:i18n` / `test:i18n`）。 |
| `.agents/skills/check-theme-architecture/scripts/lib/lint-allow.js`、`theme-contracts.js`、`*stylesheet-carry.test.js`、`theme-architecture.test.js` | 仅 S | S | skeleton 校验核心；替代 my-theme-1 的 `css-layer-allowlist.json` 路径（见 **?**）。 |
| `.agents/skills/gsap-{core,performance,scrolltrigger,timeline}/`（各 LICENSE/SKILL/UPSTREAM） | 仅 S | **?** | 母版 GSAP 技能包；my-theme-1 `assets/` 无 gsap 引用（`rg gsap assets/` 无匹配）。 |
| `.agents/tools/doctor-agent.mjs`、`lint-doc-paths.mjs`、`lint-doc-paths.test.mjs` | 仅 S | S | skeleton Agent 体检与文档路径 lint（`AGENTS.md:26`）。 |
| `.claude/agents/implementer.md`、`.claude/agents/verifier.md` | 仅 S | S | skeleton 仅保留两角色 client shim（与 `.agents/roles/` 对齐）。 |
| `LICENSE.md`、`THIRD_PARTY_NOTICES.md` | 仅 S | S | skeleton 许可与第三方清单（`AGENTS.md:20` 要求维护 NOTICES）。 |
| `docs/agent/board.md`、`docs/project.md`（skeleton 正文） | 仅 S | **M** / **T** | skeleton 母版 `project.md` 描述 mother template（`docs/project.md:7–8`）；业务主题应改写为 Ceylune 身份（用户规则：**project.md 标 T** = 以主题为准撰写，非复制母版）。`board.md` 可随 skeleton 迁入空板。 |
| `docs/references/architecture/theme-blocks.md` | 仅 S | **?** | 与「不迁移 theme blocks」冲突；见 §4。 |
| `svgo.config.cjs` | 仅 S | S | 替代 my-theme-1 的 `.agents/skills/build-svg-icons/scripts/svgo.config.js`（`build:svg` 脚本，skeleton `package.json:9`）。 |
| `blocks/*.liquid`（4 个） | 仅 S | **不迁入** | 本步排除；与产品决策一致。 |

### 2.3 仅 my-theme-1（删除或例外）

| 路径 | 状态 | 结论 | 理由 |
|------|------|------|------|
| `.agents/contracts/*.json` | 仅 T | D | skeleton 无多 Agent task/result schema；新流程用 Batch SOP + Verifier（skeleton `AGENTS.md:73–93`）。 |
| `.agents/roles/docs-steward.md`、`orchestrator.md`、`scout.md`、`validator.md` | 仅 T | D | skeleton 仅 `implementer` / `verifier`。 |
| `.agents/skills/agent-router/`、`orchestrate-agents/`（含 scripts/hooks 测试） | 仅 T | D | skeleton 明确不再依赖 router/orchestrate（对比 skeleton `AGENTS.md` 无 agent-router 条款）。 |
| `.agents/skills/build-svg-icons/` | 仅 T | D | 由根目录 `svgo.config.cjs` + `build:svg` 取代。 |
| `.agents/skills/check-theme-architecture/css-layer-allowlist.json` | 仅 T | **?** | 仍被 my-theme-1 `lint-theme.js:27` 引用；skeleton 用 `lint-allow.js` 体系。 |
| `.agents/skills/check-theme-architecture/scripts/audit-home-motion-reveal.js` | 仅 T | **?** | 首页动效审计脚本，绑定 `templates/index.json` 与具体 section（脚本头注释 `:4–12`）；skeleton 无等价物。 |
| `.codex/agents/docs-steward.toml`、`scout.toml`、`validator.toml`、`.codex/hooks.json`、`hooks/validate-agent-result.cjs` | 仅 T | D | skeleton 裁剪 codex 适配层。 |
| `.cursor/agents/docs-steward.md`、`scout.md`、`validator.md`、`.cursor/hooks.json`、`hooks/validate-agent-result.cjs` | 仅 T | D | 同上。 |
| `docs/references/agent-workflow/multi-agent-architecture.md`、`skill-routing.md` | 仅 T | D | skeleton 将流程写入 `AGENTS.md` Batch SOP，无独立 agent-workflow 目录。 |
| `shopify.theme.toml` | 仅 T | T | 含开发店 `store = "joey-new-store.myshopify.com"`（`:1–2`）；skeleton 无此文件且 `.gitignore` 忽略该名。 |
| `tailwind/tailwind.snippets.css` | 仅 T | T（暂留） | 仅 my-theme-1 有；tailwind 批次再决是否保留或并入其他层。 |

### 2.4 两边都有、内容不同

| 路径 | 状态 | 结论 | 理由 |
|------|------|------|------|
| `AGENTS.md`、`CLAUDE.md` | 不同 | S | 规则源以 skeleton 为准（Batch SOP、Authority、`lint:doc-paths` 等）；`CLAUDE.md` 保持 symlink。 |
| `README.md` | 不同 | M | my-theme-1 为 Ceylune 主题说明（`README.md:1–5`）；skeleton 为母版 README + `doctor:agent` 说明。保留品牌/setup，并入 skeleton 的 symlink 校验与 `npm ci` 流程。 |
| `package.json`、`package-lock.json` | 不同 | M | 见 §必查项 1；`name`/描述改回业务主题；脚本以 skeleton 为主，保留 `-e development` 等主题 CLI 习惯（可选）。 |
| `.github/workflows/ci.yml` | 不同 | S | skeleton 增加 `build:tw` + `tailwind.output.css` 漂移检查与 `test:validators`（skeleton `ci.yml:24–27`）。 |
| `.prettierrc` | 不同 | S | skeleton 增加商户 JSON 的 `tabWidth: 2` override。 |
| `.gitignore` | 不同 | M | 合并 skeleton 的 `.tmp-*` / `__pycache__`（skeleton `:31–34`），**保留** my-theme-1 不忽略 `shopify.theme.toml`。 |
| `.shopifyignore` | 不同 | M | 合并 skeleton 的 `.env`、`.tmp-*`、`svgo.config.cjs`（skeleton `:43–52`）；保留对 `shopify.theme.toml` 的排除（两边均有 `:39`）。 |
| `.gitattributes` | 不同 | S | my-theme-1 多 `*.json linguist-language=jsonc`（`:1`）；skeleton 仅 `* text=auto eol=lf`。以 skeleton 为准除非依赖 linguist。 |
| `.browserslistrc`、`.theme-check.yml` | 不同 | S | skeleton `.theme-check.yml` 仅 `extends: recommended`；my-theme-1 关闭部分检查（`:3–7`）。**Theme Store 主题**是否保留关闭项需产品确认（可标实施时再看）。 |
| `eslint.config.cjs` | 不同 | S | 随 skeleton 校验栈迁入。 |
| `.claude/settings.json` | 不同 | S | 工具本地设置以 skeleton 为准（不含 secrets）。 |
| `.codex/config.toml`、`.codex/agents/implementer.toml`、`verifier.toml` | 不同 | S | skeleton 裁剪后的 codex 配置。 |
| `.cursor/agents/implementer.md`、`verifier.md` | 不同 | S | 与 skeleton 角色 shim 对齐。 |
| `.agents/roles/implementer.md`、`verifier.md` | 不同 | S | skeleton 版 Batch/Authority 边界。 |
| `.agents/skills/check-i18n/`（SKILL + `lint-i18n.js`） | 不同 | S | skeleton 增加 unused 检测与测试。 |
| `.agents/skills/check-theme-architecture/`（SKILL + `lint-*.js`） | 不同 | S | skeleton 校验更强；迁入后 **?** 项脚本需处理。 |
| `docs/agent/context.md` | 不同 | M | my-theme-1 保留 Theme Store 进行中状态（`:7–8`）；skeleton 为母版空计划。融合：保留主题 status，采用 skeleton 文件头结构（`:1–7`）。 |
| `docs/references/**`（除将删除的 agent-workflow） | 不同 | S | 以 skeleton 为架构真相来源；**theme-blocks.md** 单独 **?**。 |
| `layout/*`、`tailwind/*`（除 `tailwind.snippets.css`） | 不同 | （延后） | 见 §0。 |

---

## 3. 必查项

### 3.1 `package.json`（name / 依赖 / scripts）

| 字段 | my-theme-1 | skeleton |
|------|------------|----------|
| `name` | `"my-skeleton-theme"`（`:2`，与母版同名，疑似误留） | `"my-skeleton-theme"` + `"private": true`（`:2–4`） |
| `description` | Skeleton 官网文案（`:4`） | Internal mother template（`:5`） |
| `license` | `ISC` | `SEE LICENSE IN LICENSE.md` |
| 独有 scripts | `lint:agents`、`test:agent-hooks`（`:9–10`、`15`） | `lint:doc-paths`、`doctor:agent`、`test:*validators*`、`test:i18n` 等（`:10–21`、`29`） |
| `build:tw` / `watch:tw` | `npx @tailwindcss/cli`（`:6–7`） | 直接 `tailwindcss` CLI（`:7–8`） |
| `build:svg` | config 在 `.agents/skills/.../svgo.config.js`（`:8`） | `svgo.config.cjs`（`:9`） |
| `shopify:dev` | `-e development`（`:22`） | 无 `-e`（`:27`） |
| `lint` | 含 `lint:agents`（`:9`） | 含 `lint:doc-paths`，无 agents（`:10`） |
| devDeps 差集 | `ajv`、`browserslist`（`:37–38`） | `espree`（`:46`）；无 `ajv` |

**业务目录实际「库」使用（npm 包 vs  vendored）**

| 能力 | 证据 | npm 依赖？ |
|------|------|------------|
| Swiper | `layout/theme.liquid:24` `vendor-swiper.min.js`；多处 section 使用 `Swiper` API | 否（vendored） |
| Alpine + intersect | `theme.liquid:63–64`；`x-intersect` 于 `sections/before-after-comparison.liquid:103` 等 | 否（`vendor-alpine-intersect.min.js`） |
| GSAP | my-theme-1 业务代码无 `gsap`/`ScrollTrigger` 匹配 | 否（且当前无 vendor gsap） |

业务 Liquid/JS **不**直接 `require` 任何 runtime npm 包；devDependencies 仅服务 lint/build。

**融合后 devDependencies 建议**（外层 M 目标）

- 采用 **skeleton 全集**：`@shopify/liquid-html-parser`、`@shopify/prettier-plugin-liquid`、`@tailwindcss/cli`、`concurrently`、`eslint`、`eslint-plugin-compat`、`espree`、`fast-glob`、`globals`、`jsonc-parser`、`prettier`、`prettier-plugin-tailwindcss`、`stylelint`、`stylelint-no-unsupported-browser-features`、`svgo`、`tailwindcss`（依据 skeleton `package.json:39–55`）。
- **保留 `browserslist`**：与 `.browserslistrc` 及 `lint:compat` 一致（my-theme-1 已声明 `:38`；skeleton 有 rc 但未锁 npm 包，建议显式保留以免 CI 隐式解析）。
- **移除 `ajv`**：仅服务将删除的 `orchestrate-agents` / `lint:agents`。
- **不新增** runtime 依赖（Swiper/GSAP/Alpine 继续 vendored）。

**scripts 建议**：以 skeleton 为准；`name`/`description`/`license`/`private` 改为主题仓库值；`shopify:dev` 可 **M** 保留 `-e development` 若团队仍用 `shopify.theme.toml` 的 `[environments.development]`。

### 3.2 Theme blocks 在 skeleton 规则/校验中的位置

| 位置 | 原文要点 |
|------|----------|
| `my-skeleton-theme/AGENTS.md:93` | 变更 `blocks/` 下 liquid 或 `assets/*.js` 等需走 Verifier 审查。 |
| `my-skeleton-theme/AGENTS.md:117` | 路由阅读 `docs/references/architecture/theme-blocks.md`。 |
| `my-skeleton-theme/docs/references/architecture/javascript-runtime.md:158` | 声明 Theme Blocks 库存与 `theme-blocks.md` 所有权，与 Liquid `{% block %}` 标签无关。 |
| `my-skeleton-theme/docs/references/architecture/theme-blocks.md:3–47` | 定义 Container + 四个 block 库存与路径 `blocks/*.liquid`。 |
| `my-skeleton-theme/.agents/skills/check-theme-architecture/SKILL.md:32` | lint 范围含 `blocks/**/*.liquid`。 |
| `my-skeleton-theme/.agents/skills/check-theme-architecture/scripts/lint-theme.js:28` 等同 glob | 校验扫描 `blocks/**`（空目录时通常无文件可扫，**不强制存在 blocks**）。 |

**结论**：skeleton **不**要求本仓库必须有 theme blocks 文件才能跑通 glob，但 **AGENTS 与 theme-blocks.md 将 Theme Blocks 作为架构文档与审查范围**；my-theme-1 不迁移 blocks 时，应计划删除或改写 `theme-blocks.md` 并调整 `AGENTS.md:117`（否则 Agent 被指向不存在的库存）。

### 3.3 Prettier 与 ignore

| 文件 | 对比结论 |
|------|----------|
| `.prettierrc` | skeleton 多 JSON override（§1.3）；结论 **S**。 |
| `.prettierignore` | **相同**；均 **未** 排除 `templates/*.json` / `config/settings_data.json`。 |
| `.gitignore` | skeleton 忽略 `shopify.theme.toml`；my-theme-1 否 → **M**（§1.3）。 |
| `.shopifyignore` | skeleton 多 `svgo.config.cjs`、`.env`、scratch 模式 → **M** 合并。 |

### 3.4 CI（`.github/workflows/ci.yml`）

| 步骤 | my-theme-1 | skeleton |
|------|------------|----------|
| `npm ci` + `npm run lint` | 有 | 有 |
| `npm run build:tw` + `git diff --exit-code assets/tailwind.output.css` | **无** | **有**（`:24–25`） |
| `npm run test:validators` | **无** | **有**（`:27`） |
| `theme-check-action` | 相同 | 相同 |

结论：**S** 采用 skeleton workflow；迁入后若尚未重建 `tailwind.output.css`，首次 CI 可能失败直至 tailwind 批次或本地 `build:tw` 提交生成物。

### 3.5 规则 vs my-theme-1 运行时现状（只列清单，无修复方案）

skeleton 文档/母版 **已有**、my-theme-1 **尚未** 对齐的约定与文件：

**文档中的 API/标记**

- `alpine.adapter.js` 为唯一 `window.Alpine` 入口（skeleton `javascript-runtime.md:67`、`:203`）
- `cart.contract.js` 购物车契约（`:15`、`:171`）
- `data-module-id` / `data-module-lazy` + import map 动态 `import()`（`:21`、`:40–47`）
- `define()` / `adapter.mount` 组件模型（对比 my-theme-1 仍写 `Components.register()`，`javascript-runtime.md:90`）
- `assets/section-pagination.js`、`sectionPagination()`（skeleton `javascript-runtime.md:150`）
- Theme Editor 转发 `theme:editor:*`（skeleton `:113`）

**skeleton 有、my-theme-1 无的 `assets/*.js`（`git ls-files assets/*.js` 对比）**

- `alpine.adapter.js`、`cart.contract.js`、`accordion.js`、`buy-buttons.js`、`cart-page.js`、`dropdown.js`、`localization-switcher.js`、`product-gallery.js`、`quantity-selector.js`、`section-pagination.js`、`variant-picker.js`

**my-theme-1 有、skeleton 无（业务批次再处理）**

- 全套 `alpine.components.*.js`、`alpine.store.*.js`（除部分同名如 `cart`/`events`/`https` 等 **内容也不同**）
- `dialog-motion.js`、`drawer-motion.js`
- `vendor-swiper.min.js`、`vendor-alpine-intersect.min.js`

### 3.6 路径引用（skeleton 文档 → 迁入外层后 my-theme-1 仍缺失的路径）

方法：读取 skeleton 文档中的 `` `top-level/...` `` 引用，在 **当前** my-theme-1 树上检查存在性；迁入 skeleton 的 `docs/`、`AGENTS.md`、`.agents/` 后，下列路径仍会指向不存在资源（业务/后续批次前）：

| 引用 | 典型行 | 迁入外层后仍缺失？ |
|------|--------|-------------------|
| `blocks/group.liquid` 等四个 | `theme-blocks.md:44–47` | **是**（不迁入 blocks） |
| `sections/custom-section.liquid` | `theme-blocks.md:12` | **是** |
| `assets/section-pagination.js` | `javascript-runtime.md:63`、`:150` | **是**（直至 JS 批次） |
| `assets/alpine.adapter.js`、`cart.contract.js` 等 | `javascript-runtime.md` 表格 | **是** |

迁入外层 **会新增**、从而消除的缺失：`docs/project.md`、`docs/agent/board.md`、`docs/references/architecture/theme-blocks.md`、`.agents/tools/lint-doc-paths.mjs` 等。

**说明**：完整 `lint:doc-paths` 以 skeleton 工具实现为准（`lint-doc-paths.mjs:17–30` TOP_LEVEL_DIRS）；在仅迁入外层、不迁 blocks/JS 的阶段，**预期 `npm run lint:doc-paths` 失败**，直至文档删减或代码批次补齐。

### 3.7 符号链接

| 路径 | my-theme-1 | skeleton | 备注 |
|------|------------|----------|------|
| `CLAUDE.md` | `120000` → `AGENTS.md` | 同 hash `47dc3e3d...` | 一致 |
| `.claude/skills` | `120000` → `../.agents/skills` | 同 hash `2b7a412b...` | 一致 |
| `AGENTS.md` | `100644` 普通文件 | `100644` | **非** symlink |

**本机** `core.symlinks=true`：clone/checkout 时应写出 symlink 而非文本副本。

**Windows `git checkout` 风险**

- 若目标工作树无创建 symlink 权限，Git 可能写出 **普通文件** 或失败；`CLAUDE.md` / `.claude/skills` 错位会导致 Claude 读不到 skills。
- 缓解（执行阶段，本报告不执行）：Developer Mode / 管理员、`git clone -c core.symlinks=true`、迁入后运行 skeleton `npm.cmd run doctor:agent`（`README.md:36–39`）校验适配器。

`git hash-object` 对 `.claude/skills` 在部分环境报 `Permission denied`（本机 junction 权限），不影响仓库内记录的 `120000` 模式。

---

## 4. 待决问题（标 ?）

1. **`audit-home-motion-reveal.js`**：删除会丢失针对 Ceylune 首页 `templates/index.json` 的动效 hook 审计（脚本 `:10–12` 默认 index 模板）。skeleton **无**替代脚本。选项：迁入后保留于 `.agents/tools/` 或 `check-theme-architecture/scripts/` 并挂 optional script；或弃用。
2. **`css-layer-allowlist.json`**：删除后 my-theme-1 版 `lint-theme.js` 的 layer 检查失效；skeleton 用 `lint-allow.js` + 注释 `lint-allow` 机制。选项：完全切换 skeleton `lint-theme.js`（**S**）并放弃 allowlist 文件；或把 allowlist 规则迁移为 skeleton 格式。
3. **`docs/references/architecture/theme-blocks.md` + `AGENTS.md:117`**：不迁 blocks 时是否 **D** 该文档并改 AGENTS 路由，或保留文档但标为「本主题不适用」。
4. **GSAP 四技能目录（仅 skeleton）**：my-theme-1 无 GSAP 资产；是否仍 **S** 迁入以备将来，或 **D** 减小 `.agents/skills` 体积。
5. **`.theme-check.yml` 禁用项**（my-theme-1 `UnusedDocParam` / `UnusedAssign`）：随 skeleton **S** 会重新启用；是否接受 Theme Check 噪音或后续在主题分支恢复关闭。

---

## 5. 建议执行顺序（仅计划，不执行）

前置：`git -C d:\fjh\shopify\my-theme-1 remote add skeleton ../my-skeleton-theme`（若尚未添加）。

1. **备份与分支**：确认在 `refactor/skeleton-shell`；可选 `git tag pre-outer-migration`。
2. **删除将被 D 取代的路径**（先 `git rm` 再 checkout，避免冲突）：
   - `.agents/contracts/`、`.agents/skills/agent-router/`、`.agents/skills/orchestrate-agents/`、`.agents/skills/build-svg-icons/`
   - `.agents/roles/{docs-steward,orchestrator,scout,validator}.md`
   - `docs/references/agent-workflow/`
   - `.codex/hooks.json`、`.codex/hooks/`、多余 `.codex/agents/*.toml`
   - `.cursor/hooks.json`、`.cursor/hooks/`、多余 `.cursor/agents/*.md`
3. **自 skeleton 批量 checkout（S）**：
   ```bash
   git -C d:/fjh/shopify/my-theme-1 fetch skeleton
   git -C d:/fjh/shopify/my-theme-1 checkout skeleton/main -- AGENTS.md CLAUDE.md README.md LICENSE.md THIRD_PARTY_NOTICES.md package.json package-lock.json .github/ .agents/ .claude/ .codex/ .cursor/ docs/ eslint.config.cjs .prettierrc .prettierignore .theme-check.yml .browserslistrc .gitattributes svgo.config.cjs stylelint.config.cjs .editorconfig .vscode/ .mcp.json
   ```
   **不要** checkout `blocks/`、`layout/`、`tailwind/`（本步范围外）。
4. **手工融合（M）**：
   - `package.json`：`name`/描述/`license`；可选保留 `shopify:dev` 的 `-e development`；devDeps 按 §3.1 加 `browserslist`、去 `ajv`。
   - `.gitignore`：合并 scratch 规则，**不要** skeleton 的 `shopify.theme.toml` 行。
   - `.shopifyignore`：合并 `.env` / scratch / `svgo.config.cjs`。
   - `docs/project.md`：用 Ceylune / Theme Store 身份重写（保留 skeleton 章节结构可参考）。
   - `docs/agent/context.md`：保留 my-theme-1 提交/审查状态，更新为 skeleton 模板说明。
   - `README.md`：Ceylune 品牌 + skeleton 的 symlink/`doctor:agent` 段落。
5. **保留仅 T**：
   - `git checkout HEAD -- shopify.theme.toml`（若步骤 3 误覆盖）
   - 保留 `tailwind/tailwind.snippets.css`（步骤 3 未含 `tailwind/` 即默认保留）
6. **处理 ? 项**（决策后）：
   - 决定是否 `git rm docs/references/architecture/theme-blocks.md` 并编辑 `AGENTS.md`
   - 决定是否保留 `audit-home-motion-reveal.js` / GSAP skills
7. **符号链接验证**：`git ls-files -s CLAUDE.md .claude/skills`；`npm.cmd run doctor:agent`（执行阶段）。
8. **`npm ci` + 预期失败的 lint**：外层 alone 时 `lint:doc-paths` / 全量 `lint` 可能失败属预期（§3.5–3.6）；记录缺口给 JS/layout/tailwind 批次。
9. **本步不** `git commit`，待人工审查本报告与 ? 项后再提交。

---

*报告生成方式：两边 `git ls-files` 过滤、`git hash-object` 对比、`rg`/文件读取；未修改两个主题仓库内任何文件。*
