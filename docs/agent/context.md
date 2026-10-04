# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-04.

## Batch 6-A1: accent colour role

**Status:** executed 2026-10-04; independent review PASS 2026-10-04 (one record correction, applied). Theme Editor live preview unproven (no editor session).

**Outcome:** the colour scheme gets an `accent` colour. It is a semantic role, not a colour specific to pagination. The home slideshow's active pagination pill uses it in place of the primary button colour. The design's bright lime is the definition default.

**Dependencies:** none. `config/settings_data.json` is **not** edited. Its schemes have no `accent_color` key, so every scheme falls back to the definition default. The merchant can then change the value per scheme in the editor.

**Implementation surface:**

- `config/settings_schema.json`, colour scheme group `definition`:
  - add a `header` (`t:config.colors.accent`);
  - add a `color` setting `accent_color` (`t:config.colors.accent_color`, plus an `info` that names its uses: pagination, highlights);
  - place both after the badges group and before feedback messages.
  - The default is the design lime, sampled from `docs/design/home/slides-show/desktop.png` (active pill). Record the hex value in this file.
  - Do not touch `role` (Shopify's role keys are a fixed set).
- `locales/en.default.schema.json`: add the two or three new keys under `config.colors`.
- `snippets/css-variables.liquid`: add `--color-accent: r, g, b;` in the per-scheme block, next to the badge variables, in the same triplet format.
- `tailwind/tailwind.input.css` `@theme inline`: add `--color-accent: rgb(var(--color-accent));`. If that name clashes with the raw triplet variable, use the existing pattern instead: rename the raw variable (for example `--color-accent-raw`), or follow how `--color-badge` maps `--color-badge-background`, and record which choice was made. Rebuild `assets/tailwind.output.css` with `npm.cmd run build:tw` (it is generated; never hand-edit it).
- `sections/slides-show.liquid` `{% stylesheet %}`: `.slides-show__dot-fill` uses the accent colour instead of `rgb(var(--color-primary-button))`. Inactive dot and toggle colours stay as they are.
- Record files: this file and the design specification entry in `docs/agent/board.md`.

Out of scope: badges, tags, any other consumer, `settings_data.json`, a contrast "on accent" colour, and the shared carousel controls component.

**Review tier:** Ask (schema and Liquid change; runs from an external prompt). An independent reviewer in a separate session runs the review, including browser checks.

**Acceptance checks:**

1. `grep -n accent_color config/settings_schema.json` shows exactly one setting in the colour scheme `definition`, with a 6-digit hex default equal to the sampled lime. `role` is unchanged (`git diff` shows no change in the `role` object).
2. `git diff --stat` touches only the surface files and `assets/tailwind.output.css`. `config/settings_data.json` is unchanged.
3. Validators pass:
   - `npm.cmd run lint:theme`
   - `npm.cmd run test:theme-check`
   - `npm.cmd run lint:i18n`
   - `npm.cmd run scan:compat`
   - `npm.cmd run lint:liquid-syntax`
4. Browser, on the home page at 1440 and at 390. All values are computed values; 1rem = 10px.
   - `getComputedStyle(document.querySelector('.color-scheme-1') || document.body).getPropertyValue('--color-accent')` returns the lime triplet. Every rendered `.color-scheme-*` element has a non-empty value.
   - Active pill fill: `getComputedStyle(document.querySelector('.slides-show__dot.is-active .slides-show__dot-fill')).backgroundColor` equals `rgb(<lime>)`.
   - The inactive dots and the autoplay toggle have the same computed colours as before the change (compare against `git stash` or HEAD).
   - Active pill against its surroundings: report the contrast ratio of the lime against the inactive dot track colour and against the slide overlay or image area behind it. Report it; do not gate on it. WCAG 1.4.11 applies to the dot outline or track, not the fill.
   - The progress still fills from 0 to 100% during autoplay, and stays at 100% with `motion_enabled` off.
   - No console errors.
5. Theme Editor (if the reviewer has access): Theme settings → Colors → scheme 1 shows the new "Accent" heading and colour. Changing it updates the pill live. Do not save.

### Progress

#### Sampling (design PNGs)

- **Desktop** (`desktop.png`, active pill fill centre ~862×469): mode **#D5FF83** → `rgb(213, 255, 131)`.
- **Mobile** (`mobile.png`, bottom progress bar): mode **#CEF981** → `rgb(206, 241, 129)` (same family; slightly less saturated in export).
- **Schema default:** `#D5FF83` (desktop authoritative per plan).

#### Token naming

- Per-scheme **triplet** (acceptance `getPropertyValue('--color-accent')`): `--color-accent` in `snippets/css-variables.liquid` (comma-separated RGB).
- **Tailwind `@theme inline`:** `--color-accent-ui: rgb(var(--color-accent))` (avoids self-reference cycle; mirrors badge pattern where the triplet is `--color-badge-background` and the utility token is `--color-badge`).
- **Slideshow fill:** `rgb(var(--color-accent))` in section stylesheet (not the Tailwind token).

#### Validators (2026-10-04)

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | pass |
| `npm.cmd run test:theme-check` | pass (146 files, 0 offenses) |
| `npm.cmd run lint:i18n` | pass |
| `npm.cmd run scan:compat` | pass (includes `build:tw`) |
| `npm.cmd run lint:liquid-syntax` | pass |

#### `git diff --stat` note

- Surface files only; **`assets/tailwind.output.css` unchanged** after `build:tw` (Tailwind v4 did not emit `--color-accent-ui` until a utility references it). `config/settings_data.json` untouched.

#### Browser (`http://127.0.0.1:9292/`, Chrome DevTools MCP page 13)

**Root font:** `html` computed `font-size` reports **12px** (Chrome minimum font clamping of the 62.5% value); a measured 1rem box is **10px**, so the 4.8rem pill is 48px (reviewer).

**1440×900**

| Check | Measured |
| --- | --- |
| `body` `--color-accent` | `213, 255, 131` |
| `.color-scheme-*` (26 nodes) | all `213, 255, 131`; **0** empty |
| Active fill `backgroundColor` | `rgb(213, 255, 131)` |
| Inactive `.slides-show__dot` background | `rgba(213, 255, 131, 0.5)` |
| Autoplay toggle background / color | `rgba(213, 255, 131, 0.12)` / `rgb(213, 255, 131)` |
| Autoplay progress width | `13.86px` → `25.44px` → `37px` over ~2.4s (`--slides-show-progress` 0.289 → 0.53 → 0.771) |
| `body[data-motion-enabled='false']` active fill width | `48px` (CSS `width: 100% !important` on fill) |
| Contrast lime vs inactive dot | **3.02:1** against `rgba(213,255,131,0.5)` composited over the section background `rgb(27,41,0)`; lime vs that background **13.54:1** (reviewer correction; the earlier 1:1 ignored alpha) |
| Contrast lime vs area behind controls | **~18.46:1** (sampled stack under pagination) |
| Console | Shopify dev noise only (CORS CDN script, shop.app CSP, customer-account menu, 404); **no slideshow errors** |

**390×844**

| Check | Measured |
| --- | --- |
| `body` `--color-accent` | `213, 255, 131` |
| `.color-scheme-*` | 26 nodes, **0** empty accent |
| Active fill `backgroundColor` | `rgb(213, 255, 131)` |

**Inactive / toggle vs HEAD:** `git diff sections/slides-show.liquid` changes **only** `.slides-show__dot-fill` background (`primary-button` → `accent`). Dot and toggle rules unchanged; computed inactive/toggle values are unchanged from pre-A1 for the same scheme.

**Screenshots:** `docs/design/home/slides-show/dev-desktop.png` (1440×900, prior capture), `dev-mobile.png` **retaken 2026-10-04** at **390×844** via Playwright (`npx playwright screenshot --viewport-size=390,844`) on `http://127.0.0.1:9292/` (fixes earlier byte-identical mobile copy). MD5: desktop `FE064147BFDEA49994C0CD16C024FF94`, mobile `B5913EDCC6E10C6D93D0AB7128E10903` (differ).

**Theme Editor accent picker live update:** not run (no admin session in this pass).
