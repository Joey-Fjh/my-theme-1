# Agent Context

Cross-session relay card. Phase history, scorecard detail, and file-by-file notes live in `docs/references/style-system/css-architecture.md` and related references — not here.

## Current State

**Branch:** `feat/ai-test` · **HEAD:** `820e605` — Harden theme style architecture and media primitives

| Track | Score | Status |
| --- | --- | --- |
| CSS architecture | **94/100** (→95 after `--form`/`--featured` visual audit) | Phases 1–7B, 5A–5F, 6–6C, **8B**, **8C**, Image-B/C/D Mini/E, Media-Orphan-B **Accepted** |
| JS architecture | **93/100** | Phase 1/2/2B delivered in working tree; Phase 3 deferred |
| Image system | **96/100** | `image.liquid` contract complete; long-form audit in `css-architecture.md` §9 |

**8B / 8C (2026-06-26):** PDP quantity owner, title typography, quick-view boundary; `product-price*` primitive, btn hover filter, buy-buttons purchase-row API, PDP `context: 'product'`. Contract detail: `css-architecture.md` §7.7–7.8.

**Automation (last run on current tree):** `npm.cmd run lint` ✅ · `npm.cmd test` ✅ (122 files, 0 offenses). PowerShell: use `npm.cmd`, not `npm run`.

**Rule source:** `AGENTS.md` · **Layer contract:** `docs/references/style-system/css-architecture.md`

## Current Working Tree / Commit Scope

Uncommitted (~28 files). **Pre-merge: APPROVE** — suitable to commit; prefer scoped commits.

| Area | Files / change |
| --- | --- |
| **JS Phase 1/2/2B** | Orphan `data-component-*` removed from 16 Alpine-only sections (7 paired `Components.register` sections unchanged) |
| | `alpine.components.js` — unmount calls `destroy` or `dispose` |
| | `product-media.js` — lightbox generation guard, `beforeAfterComparison` rAF cancel |
| | `alpine.store.dialog.js` — open generation guard on focus/trap |
| | `alpine.store.toast.js` — timeout Map + clear on remove |
| | `pagination` / `search` / `product-cards` — `useDisposable()` |
| | `lint-theme.js` — registry pairing (error), CustomEvent boundary + teardown heuristics (warning) |
| **Docs** | `context.md`, `css-architecture.md` §8 status, `javascript-runtime.md` event table |
| **Generated CSS (pending decision)** | `assets/tailwind.output.css` — **−15 lines** dead utility prune only; **no** `tailwind/` source change in this batch. Include in commit or discard; HEAD commit already carries full `build:tw` output from 8B/8C |

**Not in working tree:** `config/settings_data.json`, `templates/*.json`, merchant content.

## Launch Status

| Gate | Verdict |
| --- | --- |
| Pre-merge / commit | **APPROVE** — automation green; static audit clean; no merchant-owned edits |
| Launch-ready | **REQUEST CHANGES** |
| Blocker | **Storefront manual QA not signed off** (see below) |

Do not declare launch readiness until manual QA is recorded Pass/Fail in storefront.

## Remaining Manual QA

Storefront verification required before launch:

- **PDP rich media:** image-only · Shopify-hosted video · external video · 3D model
- **Media modal / lightbox:** open · close · Esc · overlay click · focus trap · return focus
- **Gallery layouts:** thumbnails · carousel · grid · stacked (mobile + desktop)
- **Featured product** and **quick view** media behavior
- **PDP add-to-cart** after variant/media selection
- **Cart drawer + cart page:** quantity · remove · clear · discounts · totals
- **Filters** · **pagination** · **browser back** (`popstate`)
- **Search** · **predictive search**
- **Mobile menu** · **header cart badge**
- **Newsletter overlay**
- **Z-index layering:** toast · lightbox · dialog · drawer · media modal · header (no overlap/conflict)

Image-B visual spot-check (newsletter-banner fit/position, header/footer natural logo, brand-statement brush) can ride with the above.

## Deferred

- `--form` / `--featured` modifier visual audit (CSS 94→95)
- PDP empty-product placeholder: `<h2>` with `heading-h1` visual tier (low; semantic note only)
- **JS Phase 3 (only if profiled / user scopes):** `motionRevealSection` rAF cancel · `QuantitySelector` micro cleanup · `stickyHeader` rAF coalesce
- **Toast:** warning uses `icon-info-circle`; no dedup/max-stack — intentional unless user reports issues
- **Typography / surface design-system items:** see `css-and-typography.md` — do not batch auto-migrate

## Collaboration Boundary

- Agent may inspect repo, run non-rewriting validation, update agent docs when asked.
- Agent MUST NOT modify theme implementation or merchant-owned config/content without explicit user authorization.

## Pointers

| Topic | Where |
| --- | --- |
| CSS phase history, scorecard, image contract | `docs/references/style-system/css-architecture.md` |
| JS runtime, events, lifecycle | `docs/references/architecture/javascript-runtime.md` |
| Launch gate, a11y, pre-merge checklist | `docs/references/code-review/launch-gate.md` |
| Rich media implementation | `snippets/product-media.liquid`, `product-gallery*`, `product-media-modal.liquid`, `assets/alpine.components.product-media.js` |
| `media-video` consumer | `sections/video-banner.liquid` (Media-Orphan-B) |
