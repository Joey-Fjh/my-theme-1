# Phase 1 — Outer-layer retention audit (read-only)

Compared **before** `af05311` (`git show af05311:<path>`) vs **after** staged index (`git show :<path>` / `git ls-files`). Business directories excluded per plan. Skeleton source: `5191a50` (`skeleton/main`).

---

## 1. Summary

**Is the outer layer fully migrated?** **Yes, mechanically; no, for live storefront semantics.**

- **Mechanical (yes):** Staged agent tree matches skeleton except `docs/references/architecture/theme-blocks.md` (intentionally omitted). Business dirs unchanged vs `main` (`docs/agent/context.md:36–37`, `docs/project.md:14`). Validator wiring, CI, and configs come from skeleton (`docs/migration/step1/validation.md`).
- **Semantic (no):** Storefront still runs the **pre-migration** runtime (`Components.register`, `ShopifyHttp`, `$store.cart`, `motion_enabled` in CSS) while outer docs and `lint:theme` enforce the **skeleton target** (`data-module-id`, `cart.contract.js`, import map) (`docs/project.md:40–41`, `AGENTS.md:12–17` vs `assets/base.js` / `layout/theme.liquid` — business, cited only as gap context).

**Category counts (rules + knowledge + validator rows below):**

| Class | Count | Meaning |
| --- | ---: | --- |
| **A** | 28 | Skeleton already covers; no action |
| **B** | 14 | Obsolete with new agent/runtime model |
| **C** | 12 | Theme-specific, still valid — should be retained in records |
| **D** | 11 | Rewrite or re-validate in phases 2–4 |

**Top 5 attention items**

1. **`motion_enabled` / `motionRevealSection()` policy** removed from references but still in live CSS/sections (`af05311:docs/references/architecture/motion-architecture.md:33,49` → new `motion-architecture.md` has no `motion_enabled`; `tailwind/tailwind.animates.css` still governs motion — business).
2. **`css-layer-allowlist.json` deleted** — held Ceylune-specific CSS lint exceptions (`product-gallery__thumbnail` tab class, promoted snippet prefixes) (`af05311:.agents/skills/check-theme-architecture/css-layer-allowlist.json:1–11` → **新体系中无对应**).
3. **Old `lint-theme.js` theme guards gone** — `Components.register` ↔ `data-component-type`, `tab-nav-item`, `.category-grid__item` WebKit width, `components.css` `*-section` ban, `CustomEvent` vs `ThemeEvents` (`af05311:lint-theme.js` patterns → new `.agents/.../theme-contracts.js` has no equivalents).
4. **Phase 0 inventory untouched** — capabilities, merchant JSON refs, browser checklist remain the behavior contract (`docs/migration/phase0/` — **未变**).
5. **Skeleton-only `theme-blocks.md` not imported** — correct for section-block-only theme (`docs/project.md:36`); skeleton file absent by design (`skeleton/main` has `docs/references/architecture/theme-blocks.md` → not in index).

---

## 2. Coverage table

Legend: **未变** | **被 skeleton 同名文件替换** | **删除** | **手工融合**

### 2.1 Files present at `af05311` (82 paths)

| Path group | Count | Predominant fate |
| --- | ---: | --- |
| `.agents/contracts/`, orchestration roles/skills, hooks | 18 | **删除** (skeleton uses Implementer + Verifier only; no result/task schemas or hooks) |
| `.agents/skills/check-*` (except deleted scripts) | 8 | **被 skeleton 替换** (+ new tests, `theme-contracts.js`, GSAP skills in index) |
| `.agents/skills/{agent-router,orchestrate-agents,build-svg-icons}` | 6 | **删除** (`svgo.config.cjs` at repo root replaces embedded `svgo.config.js`) |
| `.codex/`, `.cursor/` adapters (docs-steward, scout, validator, hooks) | 12 | **删除** or **被 skeleton 替换** (implementer/verifier only) |
| `docs/references/agent-workflow/*` | 2 | **删除** |
| `docs/references/{architecture,code-review,style-system}/*` | 8 | **被 skeleton 替换**, except `javascript-runtime.md` **手工融合** (`:158` Ceylune section blocks) |
| `docs/{project,agent/*,migration/*}` | 9 | **未变** or **手工融合** (theme-owned records + phase 0/1) |
| Root configs (`AGENTS`, `package*`, `README`, ignores, CI, eslint, theme-check) | 15 | **手工融合** or **被 skeleton 替换** |
| `shopify.theme.toml` | 1 | **删除** (untracked; skeleton `.gitignore` — `docs/project.md:37`) |
| `liquid-ast.js`, `.editorconfig`, `.mcp.json`, `.prettierrc`, `.vscode` | 3 | **未变** |

**Per-file listing (af05311 → fate):**

| File | Fate |
| --- | --- |
| `.agents/contracts/result.schema.json` | 删除 |
| `.agents/contracts/task.schema.json` | 删除 |
| `.agents/roles/docs-steward.md` | 删除 |
| `.agents/roles/implementer.md` | 被 skeleton 同名文件替换 |
| `.agents/roles/orchestrator.md` | 删除 |
| `.agents/roles/scout.md` | 删除 |
| `.agents/roles/validator.md` | 删除 |
| `.agents/roles/verifier.md` | 被 skeleton 同名文件替换 |
| `.agents/skills/agent-router/SKILL.md` | 删除 |
| `.agents/skills/build-svg-icons/SKILL.md` | 删除 |
| `.agents/skills/build-svg-icons/scripts/svgo.config.js` | 删除 → replaced by `svgo.config.cjs` (index) |
| `.agents/skills/check-i18n/SKILL.md`, `lint-i18n.js` | 被 skeleton 同名文件替换 |
| `.agents/skills/check-theme-architecture/SKILL.md`, `lint-embedded-compat.cjs`, `lint-liquid-syntax.js`, `lint-theme.js` | 被 skeleton 同名文件替换 |
| `.agents/skills/check-theme-architecture/css-layer-allowlist.json` | 删除 |
| `.agents/skills/check-theme-architecture/scripts/audit-home-motion-reveal.js` | 删除 (`docs/agent/context.md:15` — recoverable from `main`) |
| `.agents/skills/check-theme-architecture/scripts/lib/liquid-ast.js` | 未变 |
| `.agents/skills/orchestrate-agents/**` (4 files) | 删除 |
| `.browserslistrc` | 被 skeleton 同名文件替换 |
| `.claude/settings.json` | 被 skeleton 同名文件替换 |
| `.claude/skills` | 未变 (symlink) |
| `.codex/**`, `.cursor/**` (steward/scout/validator/hooks) | 删除 or 被 skeleton 替换 (implementer/verifier) |
| `.cursor/mcp.json` | 未变 |
| `.editorconfig` | 未变 |
| `.gitattributes`, `.github/workflows/ci.yml`, `.gitignore`, `.prettierignore`, `.shopifyignore`, `.theme-check.yml` | 被 skeleton 同名文件替换 |
| `.mcp.json` | 未变 |
| `.prettierrc` | 未变 |
| `.vscode/settings.json` | 未变 |
| `AGENTS.md` | 手工融合 (skeleton Batch SOP + Ceylune `docs/project.md` entry; runtime wording → skeleton) |
| `CLAUDE.md` | 未变 |
| `README.md` | 手工融合 |
| `docs/agent/board.md`, `context.md` | 手工融合 |
| `docs/migration/**` (phase0, step1-outer-files) | 未变 (+ step1 artifacts added in index) |
| `docs/project.md` | 手工融合 |
| `docs/references/agent-workflow/*.md` | 删除 |
| `docs/references/architecture/abstraction-boundaries.md`, `motion-architecture.md` | 被 skeleton 同名文件替换 |
| `docs/references/architecture/javascript-runtime.md` | 手工融合 |
| `docs/references/code-review/*.md`, `style-system/*.md` | 被 skeleton 同名文件替换 |
| `eslint.config.cjs` | 被 skeleton 同名文件替换 |
| `package.json`, `package-lock.json` | 手工融合 (`name`, description, `shopify:dev -e development`) |
| `shopify.theme.toml` | 删除 (from index) |
| `stylelint.config.cjs` | 未变 |

**去向不明:** none — every `af05311` outer path maps to one of the four fates above.

### 2.2 New in index (not at `af05311`) — 35 paths

Theme migration artifacts (`docs/migration/step1/*`), `LICENSE.md`, `THIRD_PARTY_NOTICES.md`, `svgo.config.cjs`, `.agents/tools/{doctor-agent,lint-doc-paths}*`, GSAP doc skills, validator tests, `.claude/agents/{implementer,verifier}.md` — all **skeleton phase-1 additions**, not regressions.

### 2.3 In skeleton outer tree but not in this index

| Skeleton path | Reason absent |
| --- | --- |
| `docs/references/architecture/theme-blocks.md` | Ceylune uses section blocks only (`docs/project.md:36`; routing removed `AGENTS.md:117` → `docs/project.md`) |
| `blocks/**` | Business deviation — not part of outer migration scope |

---

## 3. Rules对照 (`AGENTS.md` af05311 → staged)

| # | Old rule (af05311) | Result | New location / notes |
| --- | --- | --- | --- |
| 1 | Read `docs/references/agent-workflow/` for routing (`AGENTS.md:41–42`) | 被新架构取代 | Batch SOP + `docs/project.md` (`AGENTS.md:73–109`) |
| 2 | `agent-router` / `orchestrate-agents` first (`AGENTS.md:81–82,136,144–147`) | 被新架构取代 | Coordinator-owned SOP; skills list `AGENTS.md:125–128` (validators + GSAP docs only) |
| 3 | Validate delegated results vs `.agents/contracts/result.schema.json` (`AGENTS.md:86`) | 被新架构取代 | Contracts **删除**; verifier role without JSON hook |
| 4 | Tech stack: `Components.register`, `ThemeEvents`, `ShopifyHttp`, `ShopifySectionRefresher` (`AGENTS.md:20–21`) | 被新架构取代 | `AGENTS.md:12–17`, `javascript-runtime.md:7–22` (import map, `define`, `cart.contract.js`) |
| 5 | No ESM imports (`AGENTS.md:27`) | 被新架构取代 | ES modules required (`AGENTS.md:16–17`) |
| 6 | `Components.register()` in `{% javascript %}` (`AGENTS.md:94`) | 被新架构取代 | `data-module-id` + `define()` (`javascript-runtime.md:35–47`, `AGENTS.md:67`) |
| 7 | `AlpineComponentsFactory.register()` (`AGENTS.md:95`) | 丢失 | **仍有效** on live code (`assets/alpine.components.*.js`) until phase 3–4 → **D** |
| 8 | `ThemeEvents` for cross-component events (`AGENTS.md:97`) | 新规则已覆盖 | `javascript-runtime.md:80+` (ThemeEvents); outlet rules in `theme-contracts.js` |
| 9 | `ShopifyHttp` only; `fetch` in `https.js` (`AGENTS.md:98`) | 新规则已覆盖 | `theme-contracts.js` `JS_FETCH_OUTLET` → `assets/https.js` |
| 10 | `ShopifySectionRefresher.render()` (`AGENTS.md:99`) | 新规则已覆盖 | `javascript-runtime.md:145–154` (SectionRefresher transitional) |
| 11 | Cart via `$store.cart` (`AGENTS.md:100`) | 新规则已覆盖 (target) | `javascript-runtime.md:169–173`; lint → `cart.contract.js` (`theme-contracts.js:511`) — live store still `alpine.store.cart.js` **D** |
| 12 | `motion_enabled` gate boundaries (`AGENTS.md:102`) | 丢失 | Live theme + `tailwind.animates.css`; new `motion-architecture.md` silent → **C** |
| 13 | No hide critical content behind GSAP/Alpine/Swiper/`opacity-0` (`AGENTS.md:101`) | 新规则已覆盖 | `AGENTS.md:68`, `motion-architecture.md:64–65` |
| 14 | Typography tiers / no Tailwind text on headings (`AGENTS.md:104–107`) | 新规则已覆盖 | `AGENTS.md` pruned; enforced via `lint:theme` typography checks + `css-architecture.md` |
| 15 | `build-svg-icons` skill (`AGENTS.md:147`) | 被新架构取代 | `npm run build:svg` + `svgo.config.cjs` (`AGENTS.md:145`) |
| 16 | Route `theme-blocks.md` (`af05311:117` area) | 被新架构取代 | `docs/project.md` Deviations (`AGENTS.md:117`) |
| 17 | `sections/*-group.json` merchant-owned (`AGENTS.md` — absent at af05311) | 新规则已覆盖 | `AGENTS.md:46` (skeleton addition) |
| 18 | `docs/project.md` before tasks (`AGENTS.md` — partial at af05311) | 新规则已覆盖 | `AGENTS.md:3`, `81` |
| 19 | Context7 for Tailwind only (`af05311:79`) | 新规则已覆盖 | Shopify Dev + Context7 (`AGENTS.md:107–108`) |
| 20 | Never edit `tailwind.output.css`, icons pipeline (`AGENTS.md:109–113`) | 新规则已覆盖 | `AGENTS.md:71`, `145–149` |

**丢失且仍对 live 主题有效:** rows **7, 12** (until phases 3–4 / doc restore).

---

## 4. Knowledge extraction

| Source (af05311) | Theme-specific content | New system counterpart | Class | Suggested home |
| --- | --- | --- | --- | --- |
| `css-layer-allowlist.json` | `tabNavRoleTabClassAllowlist`: `product-gallery__thumbnail`; `snippetsPromotedPrefixes`: `tab-nav-item`, `accordion__`, `icon-with-text-item`, `buy-buttons__`; `motionLintExcludedFiles`: `tailwind.animates.css` | **无** | **C** | Phase 2 tailwind ownership map; optional theme-only lint allowlist or doc in `docs/references/style-system/css-architecture.md` |
| `motion-architecture.md:33,49` | `motion_enabled` / `data-motion-enabled`; `motionRevealSection()` + `data-motion-section` | Skeleton `motion-architecture.md` generic (`:30` “derived theme defines”) | **C** | Theme motion addendum (reference or `docs/project.md`) before phase 4 slice |
| `audit-home-motion-reveal.js` | Homepage motion/reveal audit helper | Deleted | **B** | Recover from `main` if needed; not launch blocker |
| `agent-workflow/skill-routing.md` | When to use which skill/docs | Batch SOP | **B** | — |
| `agent-workflow/multi-agent-architecture.md` | Scout/validator/orchestrator, contracts | Implementer + Verifier only | **B** | — |
| `agent-router` SKILL | Task classification matrix | Coordinator steps 1–9 | **B** | — |
| `orchestrate-agents` SKILL | Delegation capsules, hook validation | SOP § delegation proposal | **B** | — |
| `build-svg-icons` SKILL | SVGO workflow prose | `README.md` + `AGENTS.md:145` | **A** | — |
| `docs/migration/phase0/*` (unchanged) | CAP IDs, `promo-bannder` typo, section types, browser rows | Still authoritative for “preserve behavior” | **A** | Keep; phase 4 acceptance |
| `javascript-runtime.md` (old) | `Components.register`, `AlpineComponentsFactory`, defer script graph | Staged doc = skeleton target | **D** | Phase 3–4 rewrite `assets/` + `layout/` |
| `abstraction-boundaries.md` (replaced) | Ceylune snippet/section ownership examples | Skeleton generic boundaries | **C** | Reconcile in phase 2 when mapping mixed dirs |
| `browser-compatibility.md` (replaced) | May have dropped WebKit marker/grid probes tied to old lint | Skeleton matrix + `lint:compat` | **C** | Port WebKit checklist items from old lint messages if still needed |
| `i18n-checklist.md` / new i18n lint | Stricter schema string rules | Same files, tougher lint | **D** | Phase 4 locale keys (5 findings in `validation.md`) |
| `THIRD_PARTY_NOTICES` (new) | Swiper + Alpine Intersect entries | Present in index | **A** | — |
| Board evidence (`board.md:19`) | `promo-bannder` must not rename | Still on board | **C** | `board.md` / phase 4 merchant JSON care |

---

## 5. Validator对照 (af05311 `lint-theme.js` → staged `lint-theme.js` + `theme-contracts.js`)

| Old check (af05311) | Protected behavior | New counterpart | Class |
| --- | --- | --- | --- |
| `css-layer-allowlist.json` driven rules | Theme CSS layer exceptions | **无** | **C** |
| `Components.register` ↔ `data-component-type` pairing | Section carousel lifecycle | `MODULE_DATA_MODULE_ID` only (different model) | **D** |
| Inline `<script>` vs `{% javascript %}` + register | Lifecycle ownership | `EXECUTABLE_INLINE_SCRIPT` | **A** |
| Global listeners outside register cleanup | Memory / double-bind | Partially `JS_DOCUMENT_OUTLET` (different file set) | **D** |
| `ShopifySectionRefresher.render()` string guard | Section refresh API | **无** string guard; doc only | **D** |
| `fetch()` / cart endpoint allowlists | HTTP + cart boundaries | `JS_FETCH_OUTLET`, `JS_CART_ROUTE_OUTLET` (`cart.contract.js` not `alpine.store.cart.js`) | **D** |
| `components.css` `*-section` root ban | Tailwind layer hygiene | **无** | **C** |
| Promoted selectors in `snippets.css` | Component API placement | **无** | **C** |
| `role="tab"` requires `tab-nav-item` | Tab chrome consistency | **无** (live: `sections/collection.liquid` still uses class) | **C** |
| `.category-grid__item` `w-full` WebKit probe | Grid intrinsic sizing | **无** | **C** |
| `new CustomEvent` allowlist | `ThemeEvents` boundary | **无** | **D** |
| Safari `::-webkit-details-marker` on `<summary>` | Disclosure control a11y | **无** in new linter | **C** |
| `transition-property` block scan | compat / perf | **无** | **B** or **C** |
| Browserslist assign-guard self-test | Tailwind utility probes | `lint:compat` (different mechanism) | **A** |
| Bare `AlpineComponents.` in group files | Factory indirection | **无** (Alpine adapter model) | **B** |
| Heading `text-*` on headings | Typography tiers | `TYPOGRAPHY_TIER_*`, settings chain | **A** |
| `heading-h*` on non-headings | Document outline | `typography-tier-heading` | **A** |
| `x-transition` ban | Motion ownership | `X_TRANSITION` | **A** |
| RGB `var(--color-*) / alpha` | Safari color parsing | `INVALID_RGB_ALPHA` + settings chain | **A** |
| `section-color-scheme` | Color scheme class on frame | `SECTION_COLOR_SCHEME` | **A** |
| `vendor-notices` | THIRD_PARTY | `VENDOR_NOTICES` | **A** (fixed F1) |
| `data-module-id` / import map | Module graph | `MODULE_*` checks | **A** (targets phase 3 code) |
| Alpine expression complexity | `x-data` hygiene | `LEGACY_CHECK.ALPINE_EXPRESSION` | **A** |
| Protected Liquid runtime names | Platform tags | `LEGACY_CHECK.PROTECTED_RUNTIME` | **A** |
| Tab `aria-selected` / `aria-controls` | Tab a11y | `LEGACY_CHECK.TAB_ARIA` | **A** |
| Bundled `{% stylesheet %}`/`javascript` tag rules | Editor syntax | `LEGACY_CHECK.BUNDLED_ASSET` | **A** |

**Phase 3–4 risk:** rows marked **D** — business code still follows old patterns; new linter does not enforce old guards until rewrite.

---

## 6. Classified recommendations

### A — Covered by skeleton (28 items; representative)

Skeleton replacements for references, Batch SOP, `lint:doc-paths`, GSAP doc skills, stricter typography/settings-chain/module checks, `THIRD_PARTY_NOTICES`, CI, and merchant JSON prettier ignore. Examples: `SECTION_COLOR_SCHEME`, `VENDOR_NOTICES`, `EXECUTABLE_INLINE_SCRIPT`, `build:svg` script (`AGENTS.md:145`).

### B — Obsolete (14 items; summary)

Multi-agent contracts (`result.schema.json`, orchestrator/scout/validator roles), `agent-router` / `orchestrate-agents` skills, `theme-blocks.md` import, `audit-home-motion-reveal.js` (optional tool), bare `AlpineComponents` lint, ESM prohibition, `Components.register` as **target** rule (superseded by module model). **Reason:** skeleton reduces agent surface to Implementer/Verifier and replaces runtime registration model.

### C — Theme-specific, still valid (12 items — full list)

1. **`motion_enabled` / `body[data-motion-enabled]` scope** — old `AGENTS.md:102`, `motion-architecture.md:33`; suggest theme motion addendum before phase 4.
2. **`motionRevealSection()` / `data-motion-section` pattern** — old `motion-architecture.md:49`; live sections; document alongside (1).
3. **`css-layer-allowlist.json` exceptions** — product gallery tab class, promoted prefixes, animates exclusion; phase 2 tailwind map.
4. **`tab-nav-item` + `product-gallery__thumbnail` exception** — old allowlist; collection/product UI still uses `tab-nav-item`.
5. **`components.css` vs `snippets.css` promotion rules** — old lint; `tailwind.snippets.css` comments reference phase ownership.
6. **`.category-grid__item` WebKit `w-full` guard** — old lint; `category-grid` on homepage (`templates/index.json`); add to `browser-checklist.md` row if lint not restored.
7. **Safari `<summary>` marker reset** — old lint; verify in phase 4 browser pass.
8. **Phase 0 capability inventory** — authoritative behavior list (`docs/migration/phase0/capabilities.md`).
9. **`promo-bannder` typo constraint** — `board.md:19`.
10. **Newsletter overlay stylesheet scoping note** — `sections/newsletter-banner.liquid:151` (business; ownership hint).
11. **Runtime dependency map (phase0)** — Swiper sections, intersect, cart paths until rewrite.
12. **Ceylune deviations block** — `docs/project.md:34–41` (no Theme Blocks, `shopify.theme.toml`, `-e development`).

### D — Rewrite / re-validate in migration (11 items — full list)

1. **Runtime: `Components.register` + 7 carousel sections** — phase 3–4 (`phase0/README.md` Components.register list).
2. **`AlpineComponentsFactory` + `alpine.components.*.js`** — phase 3–4 module `define()` migration.
3. **`ShopifyHttp` / `https.js` graph → `cart.contract.js` + import map** — phase 3.
4. **`$store.cart` / `alpine.store.cart.js` vs contract** — phase 3–4.
5. **`ShopifySectionRefresher` in `https.js`** — phase 3 (`section-pagination.js` doc cites).
6. **`data-module-id` on all module roots** — phase 3–4 (343 lint findings).
7. **Alpine attribute simplification (88 findings)** — phase 4 per section.
8. **ThemeEvents vs ad-hoc `CustomEvent` in `base.js`** — phase 3 events module.
9. **i18n schema hardcoding (5 sections)** — phase 4.
10. **`javascript-runtime.md` citations vs missing `assets/section-pagination.js`** — phase 3.
11. **Mixed-dir files (`layout/theme.liquid`, `base.js`, tailwind)** — phase 2 ownership map then 3–4.

---

## 7. Questions for user (reference board only; no decisions here)

- **Migration stop-loss point** — `board.md:13` (before phase 4).
- Whether **phase 2** should restore a **theme-only** CSS lint allowlist (successor to `css-layer-allowlist.json`) or rely on manual review.
- Whether **`docs/migration/`** should be excluded from `lint:doc-paths` long-term (`board.md:28` deferred).
- **Backport `.prettierignore` merchant JSON rule to skeleton** (`board.md:27` deferred).

---

*Audit complete. No files modified except this report.*
