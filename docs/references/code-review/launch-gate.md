# Launch Gate And Review Reference

This reference stores launch-readiness details that are too long for `AGENTS.md`. `AGENTS.md` remains the rule source. Read this file when reviewing launch readiness, Lighthouse findings, accessibility, SEO, rule coverage, or pre-merge safety.

## Lighthouse Issue Classification

Before changing code for a Lighthouse finding, classify the issue as one of:

1. Theme code issue.
2. Merchant configuration issue.
3. Merchant content or copy issue.
4. Uploaded asset or media issue.
5. Shopify platform, app, or vendor issue.
6. Measurement noise or run-to-run variance.

Do not code-fix configuration, content, asset, platform, or measurement-noise issues unless the user explicitly authorizes that scope.

For every Lighthouse code change, report:

- audit id
- affected element or request
- why it is code-owned
- exact file changed
- expected metric impact
- re-test instruction

Color scheme contrast, merchant copy, collection/product content, uploaded media compression, Shopify platform scripts, app scripts, and vendor payloads are not theme-code issues by default.

## Accessibility

Accessibility is a hard Theme Store requirement. Do not treat it as optional polish. Interactive behavior must be keyboard-operable, named, and understandable without adding unnecessary ARIA to static content.

### Accessibility Principles

1. Native interactive elements first.
2. Keyboard access for every interactive feature.
3. Visible focus for keyboard users.
4. Accurate accessible names and state.
5. Minimal ARIA: add ARIA only when it communicates name, state, role, or relationship that native HTML does not already provide.
6. No content access should depend on animation, hover, pointer dragging, or mouse-only interaction.

### Native Elements

- Use `<button type="button">` for actions.
- Use `<a href="...">` for navigation.
- Use native form controls (`input`, `select`, `textarea`, `button`, `label`) when possible.
- Do not use `div` or `span` as clickable controls. If legacy code has `@click` or `onclick` on a non-interactive element, convert it to `button` or `a` unless the element is truly not user-operable.
- Do not add `role="button"` to a real `<button>`.
- Do not add `tabindex="0"` to static layout or text just to make it focusable.

### Keyboard Access

All user-operable features MUST be usable with keyboard alone:

- Buttons and links must be reachable with `Tab`.
- Buttons must activate with Enter/Space through native behavior.
- Dropdowns, drawers, modals, popups, lightboxes, search overlays, filter panels, tabs, accordions, carousels, image galleries, and comparison sliders must have keyboard paths.
- Escape SHOULD close transient UI such as modals, drawers, popups, dropdowns, search overlays, and lightboxes.
- Pointer-drag interactions need a keyboard alternative, such as buttons, a range input, or arrow-key support.

### Focus Management

- Keyboard focus MUST be visible via `:focus-visible` or an equivalent tokenized focus style.
- Opening a modal, drawer, lightbox, or search overlay SHOULD move focus into the opened UI, usually to the close button, heading, or first actionable control.
- Closing a modal, drawer, lightbox, or search overlay SHOULD return focus to the trigger that opened it when possible.
- Hidden content MUST NOT contain reachable focusable elements. `x-show` is acceptable for hiding closed panels; avoid hiding focusable content only with opacity or off-screen transforms.
- Do not use `aria-hidden="true"` on a container that contains focusable elements.

### Accessible Names

- All interactive elements MUST have an accessible name.
- Icon-only controls MUST use a translated `aria-label` or an `.sr-only` text node.
- If visible text already names a button or link, do not duplicate it with an unnecessary `aria-label`.
- ARIA copy must use `| t`; schema-facing labels must use `t:`.

### State And Relationships

Add ARIA state only where it communicates real state or relationships:

- Disclosure, accordion, dropdown trigger: `aria-expanded` and `aria-controls`.
- Current page/link: `aria-current="page"` when applicable.
- Tabs: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, and roving `tabindex` when using custom tabs.
- Dialog/modal/lightbox: `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` or `aria-label`.
- Busy or loading regions: `aria-busy` when useful.
- Dynamic feedback: `role="status"` and `aria-live="polite"` for non-critical updates; use assertive announcements sparingly.

### Images, Icons, And Media

- All rendered `<img>` elements MUST have an `alt` attribute.
- Product and content images SHOULD use real alt text from Shopify image data when available.
- Decorative images use `alt=""`.
- Icons rendered through the icon snippet are decorative by default; the parent control supplies the accessible name.
- Media controls MUST use native buttons/range inputs where possible.
- Auto-playing or animated media must be pausable and must respect reduced motion where applicable.

### Anti-Patterns

| Bad                                                | Correct                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| `<div @click="open = true">Open</div>`             | `<button type="button" @click="open = true">Open</button>`         |
| Icon-only button without text or `aria-label`      | Button with translated `aria-label` or `.sr-only` text             |
| Static text with `tabindex="0"`                    | Static text remains unfocusable                                    |
| `aria-hidden="true"` around focusable controls     | Hide closed UI with `x-show`, `hidden`, or remove focusable access |
| Custom drag-only control                           | Add buttons, range input, or keyboard arrow handling               |
| `aria-label` duplicating visible button text       | Let visible text provide the accessible name                       |
| Raw icon SVG used as a control without parent name | Render icon snippet inside a named button or link                  |

## Rule Coverage

Some rules are enforced by tooling; others remain review-only. `AGENTS.md` is still authoritative in both cases.

| Rule family                               | Current coverage                   | Gate                            |
| ----------------------------------------- | ---------------------------------- | ------------------------------- |
| Inline `<script>` in Liquid               | `npm.cmd run lint:theme`               | Blocker                         |
| Inline `<style>` in Liquid                | `npm.cmd run lint:theme`               | Blocker                         |
| Complex `x-data` values                   | `npm.cmd run lint:theme` partial check | Blocker for new code            |
| Raw `fetch()` in application code         | `npm.cmd run lint:theme`               | Blocker                         |
| Direct cart endpoints outside cart store  | `npm.cmd run lint:theme`               | Blocker                         |
| Manual section HTML replacement           | `npm.cmd run lint:theme`               | Blocker                         |
| Alpine component group references         | `npm.cmd run lint:theme`               | Blocker                         |
| Heading text-size utilities               | `npm.cmd run lint:theme`               | Blocker                         |
| Heading class on non-heading elements     | `npm.cmd run lint:theme`               | Blocker                         |
| i18n key usage                            | `npm.cmd run lint:i18n` plus review    | Blocker for user-facing strings |
| CSS and JS browser feature support        | `npm.cmd run lint:compat`               | Blocker for supported browsers  |
| Known WebKit source regressions            | `npm.cmd run lint:theme`                | Blocker                         |
| CSS syntax and common style issues        | Review only                        | Warning                         |
| Redundant matching heading classes        | Review only                        | Warning                         |
| Mismatched heading classes                | Review only                        | Warning; needs user decision    |
| Redundant default body typography classes | Review only                        | Legacy warning                  |
| CSS layer placement                       | Review only                        | Warning                         |
| Motion recipe usage                       | Review only                        | Warning                         |
| Accessibility semantics                   | Review only                        | Launch blocker when user-facing |
| SEO metadata and structured content       | Review only plus Lighthouse        | Launch blocker when code-owned  |
| Generated files not hand-edited           | Review only                        | Warning                         |

Warnings may be deferred only when they do not affect Lighthouse, accessibility, SEO, runtime stability, or production behavior. Add new lint rules only when repeated review evidence justifies a stable, machine-detectable contract.

## Legacy Cleanup Safety

Use this section when normalizing older code that was produced before the current rules were stable.

Cleanup workflow:

1. Audit first; identify violations before editing.
2. Group findings by rule area: JS lifecycle, Alpine/data attributes, HTTP/cart, DOM refresh, CSS layers, i18n, accessibility, icons, and generated files.
3. Clean one rule family per change set when possible.
4. Preserve storefront behavior, visual design, schema IDs, block types, section types, and template references unless the task explicitly asks to change them.
5. Run the smallest relevant checks after each cleanup batch.
6. Summarize the rules enforced, files changed, behavior intentionally preserved, and remaining follow-up risks.

Cleanup priority:

1. Runtime-breaking bugs and Theme Check blockers.
2. Accessibility and i18n blockers.
3. JS lifecycle problems, leaks, bare global listeners, raw application `fetch()`, and direct cart endpoint calls.
4. Unsafe Liquid-to-JS data passing and complex inline Alpine expressions.
5. CSS architecture issues: inline static styles, hardcoded colors, heading typography violations, and misplaced reusable CSS.
6. Icon pipeline, generated file, naming, and formatting consistency issues.

Cleanup non-goals:

- Redesign sections or rewrite markup only for subjective style consistency.
- Rename or remove schema setting IDs, block types, section types, preset names, or template references.
- Change business logic while fixing architecture unless the behavior is already broken.
- Introduce new dependencies.
- Edit generated assets directly.
- Expand shared abstractions to accommodate legacy code unless the abstraction boundary gate has been passed.

If a violation is widespread, create a staged cleanup plan or audit report instead of changing the entire theme in one pass.

## Repo Safety And Ignore Boundaries

Repository safety rules:

1. Never edit minified vendor files (`vendor-*.min.js`, `vendor-*.min.css`).
2. Never manually edit `assets/tailwind.output.css`.
3. Never manually edit `assets/icon-*.svg`; regenerate via `icons/` + `npm.cmd run build:svg`.
4. Use 4-space indentation.
5. Prefer minimal diffs and do not reformat unrelated code.
6. Separate structural refactors from behavior changes.
7. When renaming assets, update all references such as `layout/theme.liquid`, CSS imports, README, and agent docs.

Ignore file boundaries:

- `.shopifyignore` controls what Shopify CLI uploads or syncs. Agent governance files, development tooling, source-only build inputs, and local editor metadata belong here when they should not be part of the live theme.
- `.gitignore` controls what is kept out of version control. Use it for local machine files, dependency folders, CLI state, release archives, temporary reports, and generated artifacts that should not be tracked.
- `.prettierignore` controls formatting scope only. Use it for generated files, vendor/minified files, or directories where formatting would damage examples or generated output.

Tracked governance files such as `AGENTS.md` and `docs/references/agent-workflow/` must remain in Git, must be excluded from Shopify upload, and should remain Prettier-formatted unless there is a specific formatting risk.

Do not add broad ignore patterns that hide source files, theme runtime files, schemas, locales, sections, snippets, templates, or config from review.

## Pre-Merge Self-Check

Before considering a task complete, verify all applicable items below.

### Architecture

1. Liquid-driven runtime values are passed through `data-*`, not embedded directly in `x-data`.
2. Section/block behavior is wired through `Components.register()` when lifecycle management is needed.
3. Reusable Alpine behavior is registered in `alpine.components.*.js` (grouped by domain).
4. Cross-component communication uses `ThemeEvents`, while local component events remain lifecycle-scoped.
5. Application HTTP requests use `window.ShopifyHttp`; raw `fetch()` appears only in allowed infrastructure/vendor files.
6. Shopify section HTML refresh uses `window.ShopifySectionRefresher.render()`; local text/state/class updates use Alpine bindings or `updateText()`.
7. Animation and transition changes have been classified through Motion Architecture as capability, state motion recipe, choreography recipe, or usage.
8. Before extending any shared abstraction, the three-question gate in `Abstraction Boundary Discipline` has been applied. Adding a new core-behavior-switching parameter to a public method is treated as a red flag, not as a routine change.
9. If an abstraction was extended, the changed invariants and the existing consumers checked against them have been explicitly listed.

### Product Page

1. Variant-driven behavior listens to `PRODUCT_VARIANT_CHANGED`.
2. New PDP features do not read state from sibling component DOM when an event-driven path exists.
3. Main product and featured product capability differences are explicit, not accidental.

### Assets And Styling

1. Tailwind-first styling is preserved; no ad-hoc `<style>` blocks are introduced.
2. New reusable CSS is placed in the correct Tailwind layer source file.
3. Empty `{% stylesheet %}` blocks are removed during cleanup.
4. Motion changes follow Motion Architecture; repeated Alpine transition groups use named recipes when available.
5. If Tailwind source changed, run `npm.cmd run scan:compat`.
6. If SVG source changed, run `npm.cmd run build:svg`.

### Validation

1. Update locales when new user-facing strings are introduced.
2. Update README/docs when architecture, vendor, or build expectations change.
3. Run `npm.cmd run lint` after meaningful theme changes.
4. Run `npm.cmd test` after meaningful theme changes.
5. Run `npm.cmd run scan:compat` when Tailwind source changed, then verify `assets/tailwind.output.css` is the only expected generated CSS output.
6. Run `npm.cmd run build:svg` when files in `icons/` changed, then verify generated `assets/icon-*.svg` output before using the icon snippet.
7. Keep the diff scoped to the task; avoid unrelated churn.
8. For cleanup tasks, report the rule family cleaned and any remaining staged follow-up.
