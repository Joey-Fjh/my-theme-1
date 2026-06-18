# Agent Context

This file records the current cross-session task contract and progress. Keep implementation findings and detailed file-by-file notes outside this file unless they are needed to continue the task safely.

## Active Task: Global Settings Integration

### Objective

Complete the final pre-launch integration of approved global theme settings.

Review and clean up sections, snippets, and shared styles one setting domain at a time so global settings work correctly across the storefront while preserving the existing presentation and behavior.

### Collaboration Boundary

- The user owns and performs theme implementation changes.
- The Agent audits the current phase, identifies issues, explains the reasoning, and provides file-by-file modification and validation guidance.
- The Agent MUST NOT modify theme implementation files unless the user explicitly authorizes implementation.
- The Agent MAY inspect repository files and run non-rewriting validation commands when needed.

### Core Principles

- Process one global setting domain at a time.
- Do not mix cleanup from other setting domains into the current phase.
- Record cross-phase findings for their appropriate later phase instead of fixing them immediately.
- Phase scope is defined by the current objective, not by file boundaries. A phase MAY inspect or change multiple shared, Tailwind, snippet, and section files when they are necessary to complete that domain.
- Reuse or extraction MAY be proposed during the current phase when multiple consumers share the same contract and invariants.
- Do not force reuse through mode flags, branching parameters, or abstractions that combine divergent behavior.
- If a cross-domain issue does not block the current phase, record it for the appropriate later phase.
- If a cross-domain issue blocks a correct implementation, explain the dependency and obtain explicit user approval before expanding scope.
- Preserving existing business logic, interaction behavior, and visual intent is the primary red line.
- Preserve schema IDs, block types, section types, preset names, and template references.
- Do not modify merchant-owned configuration or content.
- Complete and verify each phase independently before moving to the next phase.

### Phases

1. Typography
2. Colors
3. Inputs
4. Buttons
5. Dialogs
6. Product cards
7. Toasts
8. Cart behavior
9. Search behavior
10. Motion
11. Focus
12. Final launch regression

### Phase Review Matrix

Use this matrix to keep each phase scoped. Review and recommendations MAY span a
section, its rendered snippets, and the shared primitive that owns the current
domain. Do not fix findings owned by another phase unless they block the current
phase and the user approves the scope expansion.

| Phase | Audit | Allowed execution and recommendations | Targeted validation |
| --- | --- | --- | --- |
| Typography | Verify font settings reach CSS variables, native element defaults, typography tiers, and storefront text. Review local size, family, weight, line-height, letter-spacing, and text-transform overrides. | Connect broken typography chains; replace invalid tiers; remove only unintentional local overrides. Preserve intentional display typography and component-specific emphasis. | `npm run lint:theme`; visually check hierarchy, wrapping, and responsive sizing. |
| Colors | Verify color settings and schemes reach CSS variables, section scopes, shared primitives, and consumers. Review hardcoded colors, opacity variants, and unintended inheritance. | Connect missing color tokens; replace incorrect hardcoded or local colors; preserve intentional scheme boundaries. | `npm run lint:theme`; test relevant sections across supported color schemes. |
| Inputs | Verify global input settings reach fields, selects, textareas, labels, validation, and disabled states. Review shared field ownership and local overrides. | Connect shared input primitives; remove conflicting local input chrome; preserve form-specific layout and behavior. | `npm run lint:theme`; test keyboard entry, validation, disabled states, and mobile layout. |
| Buttons | Verify button settings reach shared button variants and all button/link consumers. Review local sizing, borders, radius, typography, and state overrides. | Connect or correct shared button variants; remove accidental local overrides; preserve intentionally distinct controls that are not buttons. | `npm run lint:theme`; test hover, focus, disabled, loading, and responsive states. |
| Dialogs | Verify dialog settings reach shared panels, overlays, drawers, and modal consumers. Review sizing, borders, radius, color, and lifecycle ownership. | Connect shared dialog styling and correct consumer usage without changing domain behavior such as cart or search logic. | `npm run lint:theme`; test open, close, escape, focus return, scroll lock, and mobile viewport behavior. |
| Product cards | Verify product-card settings and `--product-card-*` variables reach shared card styles and every card mode. Review structural and visual overrides by consumer. | Connect shared card contracts; keep genuinely divergent card modes consumer-owned; do not force reuse through mode flags. | `npm run lint:theme`; test card modes, missing media, long titles, prices, badges, and responsive grids. |
| Toasts | Verify toast settings reach shared toast styling, placement, states, and all emitters. Review message ownership and accessibility announcements. | Connect shared toast contract; correct state styling and emitter usage without changing unrelated cart/search behavior. | `npm run lint:theme`; test success/error messages, repeated events, dismissal, and screen-reader announcements. |
| Cart behavior | Verify all storefront cart mutations and cart UI state use `$store.cart`; review drawers, page cart, quantities, errors, and section refresh behavior. | Correct cart-owned behavior and state flow; use `ShopifyHttp`, `ShopifySectionRefresher`, and `ThemeEvents` where required. | `npm run lint:theme`; test add, remove, quantity changes, errors, empty cart, drawer/page synchronization, and mobile. |
| Search behavior | Verify predictive search, search overlay, results tabs, pagination, empty states, and request/state ownership. | Correct search-owned behavior and shared search contracts; preserve intentional visual overrides until their owning phase approves changes. | `npm run lint:theme`; test queries, empty/error states, keyboard flow, result types, pagination, and mobile. |
| Motion | Verify motion settings reach CSS/runtime policy, global reveal consumers, optional narrative/Swiper consumers, reduced-motion handling, and no-JS visibility. | Connect shared motion variables and current data-hook consumers; remove duplicate or conflicting choreography; keep critical content visible without animation completion. | `npm run lint:theme`; test reduced motion, no-JS/failed-init visibility, lifecycle cleanup, and responsive behavior. |
| Focus | Verify visible focus, focus order, focus trapping/return, keyboard activation, and minimal correct ARIA across interactive UI. | Correct focus and keyboard behavior without redesigning unrelated visuals or changing domain business logic. | `npm run lint:theme`; keyboard-only checks across navigation, forms, dialogs, filters, cart, search, and product media. |
| Final launch regression | Verify completed domains together for launch blockers, cross-domain regressions, mobile reliability, accessibility, SEO, Theme Check, and merchant-owned boundaries. | Fix only confirmed regressions from approved work; classify unrelated or ownership-ambiguous findings before action. | `npm run lint`; `npm test`; targeted storefront regression across core templates and supported breakpoints. |

### File-By-File Review Rhythm

- The user chooses the next implementation file; review that file before moving on.
- Review only the current phase inside that file, plus directly rendered snippets or
  shared primitives needed to verify the chain.
- Report findings and file-by-file recommendations before implementation.
- The user implements approved theme changes unless explicit implementation
  authorization is given.
- Record cross-phase findings under the owning phase instead of mixing them into the
  current file review.
- Move to the next file only after the user confirms the current file.

### Cross-Layer Phase Collaboration

Use this model when a phase concern is distributed across settings, CSS variables,
shared styles, snippets, sections, and storefront consumers. It complements the
file-by-file rhythm instead of replacing user review of page hierarchy, brand
intent, or interaction quality.

1. Define the phase contract before scanning: identify the approved global settings,
   their expected consumers, and the intentional component-specific exceptions.
2. Let an implementation Agent scan the complete chain across relevant settings,
   shared primitives, Tailwind sources, snippets, sections, and consumers. The Agent
   MAY fix only issues that are mechanically provable within the current phase.
3. Require every finding to be classified before action as one of:
   - broken global-setting chain;
   - unintentional local override or hardcoding;
   - intentional component or display override;
   - user-owned design or semantic judgment;
   - cross-phase finding to defer.
4. Preserve intentional overrides. Do not broadly remove hardcoded values merely
   because they match the current phase domain.
5. Reserve high-judgment review for the user, including main-page hierarchy, brand
   presentation, exceptional component styling, and representative storefront
   behavior.
6. Use a separate reviewing Agent as the phase gate. It MUST inspect the actual diff,
   challenge the implementation report, scan for omissions, verify ownership and
   scope, and rerun applicable validation before approving the phase.
7. Close a phase only after the global chain works, all remaining overrides are
   classified, user-owned checks are confirmed, cross-phase findings are recorded,
   and the phase Definition Of Done is satisfied.

### Completed Domains

- Layout: `page_width`, `page_margin`, `section_margin_top`, and `section_margin_bottom` are connected and currently working. Do not reopen Layout as a cleanup phase unless a concrete regression is found; verify it only during final launch regression.
- Typography: global body and heading settings reach native defaults, project
  typography tiers, RTE content, shared styles, snippets, and sections. Remaining
  local typography overrides have been classified as intentional component or
  display contracts. Recheck representative storefront pages only during final
  launch regression.
- Colors: global schemes, semantic tokens, section surfaces, independent component
  colors, opacity usage, and intentional fixed-color contracts have been audited.
  Deterministic chain issues and approved architecture decisions are resolved.
  Recheck the recorded visual states during final launch regression.
- Inputs: shared input settings and the `.field` primitive have been integrated
  across reviewed form consumers. Local input chrome overrides were removed or
  classified. Recheck representative form states during final launch regression.
- Buttons: shared button variants and global button settings have been integrated
  across reviewed consumers, including unavailable purchase states. Recheck hover,
  focus, disabled, and loading states during final launch regression.
- Dialogs: the shared `.ui-dialog-panel` chrome contract now owns global dialog
  border, radius, shadow, and background styling across modal and drawer variants.
  Recheck representative dialog lifecycle and viewport states during final launch
  regression.
- Product cards: the shared `product-card-shell` contract now consumes global
  border, radius, and shadow settings across standard, lite, variants, and
  predictive-search card modes. Global image-ratio setting reaches all Liquid
  `product-card` consumers; predictive-search retains a safe 1/1 fallback
  (search data lacks image dimensions). Local overrides in header (padding: 0,
  transparent media-frame) and predictive-search consumers (bg, hover:shadow-sm)
  have been classified as intentional. Variant panel stock labels use locale keys.
  Recheck card modes, shadow clipping in horizontal-scroll and Swiper containers,
  and focus-outline visibility during final launch regression.
- Toasts: global toast settings (radius, shadow, position, duration, preview)
  reach the shared `.toast` / `.toast--*` CSS contract and the `toastContainer`
  Alpine component. Four semantic states (success, warning, error, info) use
  color-scheme-aware tokens. `$store.cart._handleError` owns all cart mutation
  error toasts with localized messages; Product Card and BuyButtons do not
  duplicate. All user-visible toast messages use locale keys or merchant-owned
  Liquid data. `role`/`aria-live` are dynamic per toast type. Theme Editor preview
  can remain visible until dismissed without changing storefront emitter duration.
  The shared Toast contract owns intrinsic content width, bounded wrapping,
  vertically-centered content, and configurable shadow; a real border replaces
  Tailwind ring utilities so the global shadow is not overridden. Recheck toast
  contrast, screen-reader announcements, and dismiss keyboard focus during final
  launch regression.
- Cart behavior: `settings.cart_type` (drawer / page) is now wired through
  `data-cart-type` and `data-cart-url` attributes to header, PDP buy buttons,
  quick view, and product card quick add. Drawer mode opens the cart overlay
  on header icon, quick view add, and product card quick add. Page mode
  navigates to `routes.cart_url` via a real `<a>` link (header) or
  Liquid-provided `cartUrl` (JS add-to-cart flows); no drawer opens in page
  mode. All cart mutations continue through `$store.cart`; error toasts remain
  centralized in `$store.cart._handleError`. Cart overlay `fetchCart` failure
  now shows a non-empty-guarded error toast instead of silent swallow. PDP
  drawer-mode add-to-cart remains toast-only by default (`open_cart_on_add`
  defaults to false); this is preserved existing behavior, not a regression.
  Recheck drawer and page mode add/remove/quantity/clear/checkout flows,
  error scenarios, and mobile layout during final launch regression.
- Search behavior: `settings.predictive_search_enabled` is now wired through
  `data-predictive-search-enabled` on the search overlay drawer and search page
  Alpine wrappers. The `predictiveSearch` component reads the setting as
  `_predictiveEnabled` in `_applyDatasetConfig()`. When enabled (true), full
  predictive behavior is preserved: debounced fetch via `ShopifyHttp.getJSON()`
  to `/search/suggest.json`, panel open, suggestions/products/articles/pages
  tabs, empty state, and error toast. When disabled (false), `onInput()` updates
  the query but skips all fetch and panel logic; `openPanel()` and
  `_hydrateInitialQuery()` return early; `performSearch()` is not gated and
  navigates to `routes.search_url?q=...` as normal. Predictive panel, results
  tabs, and suggestions are automatically hidden since `isOpen` never becomes
  true. Search results tabs and pagination are server-rendered and independent
  of the predictive component; they remain untouched. Recheck predictive and
  non-predictive search flows, keyboard submit, empty/error states, and mobile
  drawer layout during final launch regression.

### Known Phase-Owned Chain Findings

- Motion: `motion_speed` reaches `--motion-duration`, and `--motion-ease` is defined, but neither variable is connected to shared motion recipes or runtime policy. Handle this during the Motion phase.

### Per-Phase Workflow

1. Confirm the global settings and intended behavior contract for the current domain.
2. Verify the complete chain from settings to variables or runtime policy, shared primitives, and storefront consumers.
3. The Agent audits and provides classified, file-by-file recommendations.
4. The user reviews and implements the approved changes.
5. Verify the current phase and record deferred or cross-phase findings.
6. Move to the next phase only after explicit confirmation.

### Current Phase

Motion

### Motion Architecture Decision

Ordinary animation is CSS/Alpine-first. GSAP is optional narrative choreography only.

- **Alpine** owns when / state / trigger.
- **tailwind.animates.css** owns how / animation capability.
- **GSAP** reserved for complex homepage/storytelling choreography (parallax, scrub, timeline, split text, coordinated storytelling).
- Previous Motion GSAP-first direction was reverted.
- `snippets/motion-transition.liquid` has been removed. Do not restore it, replace it with scattered `x-transition:*`, or use it as a reference for new motion work.
- Ordinary section content/media reveal should use `data-motion-reveal` hooks, an Alpine behavior with a module-level shared `IntersectionObserver`, and CSS rules in `tailwind.animates.css`.
- Each section-level `x-data` instance may be independent, but reveal observation should be shared through one observer/registry implementation, not one observer per target.
- `tailwind.animates.css` should own body setting selectors such as `body[data-content-reveal-style]`, `body[data-media-reveal-style]`, `body[data-motion-enabled]`, and reduced-motion rules.
- Existing scattered visual motion is not accepted as the final architecture. Motion behavior should either join the global `data-*` -> `tailwind.animates.css` chain or be removed.
- Preserve interaction/accessibility feedback only when it is clearly functional, such as focus states, active state affordances, loading indicators, drag handles, or component state visibility.
- Motion cleanup order is now: remove old motion systems, connect global settings, make sections/snippets/components emit semantic `data-motion-*` hooks, and let `tailwind.animates.css` own the visual behavior.

### Final Regression Checks

- Colors: visually verify password-page 20% borders, solid-color password header and
  footer chrome, merchant-configured product-comparison colors on dark schemes, toast
  contrast, dark-scheme loading overlay, and pagination current-page distinction.

### Motion Current Status

The current Motion architecture is the global reveal chain:

`settings` -> `body data-*` -> section/component `data-motion-*` hooks -> `motionRevealSection()` -> `tailwind/tailwind.animates.css`.

Completed cleanup:

- `assets/motion.js` removed.
- GSAP project consumers removed.
- GSAP vendor script tags and vendor files removed.
- `snippets/motion-transition.liquid` removed.
- Legacy `motion-*` state transition recipe CSS removed.
- Ordinary reveal sections use `x-data="motionRevealSection()"`, `data-motion-section`, and `data-motion-reveal="content|media"`.
- Motion hook ownership is semantic: media primitives such as `snippets/image.liquid` own `data-motion-reveal="media"` internally; stable content components may own their own content hooks; sections and future blocks own reveal roots and broad content groups; controls, forms, conversion-critical UI, and merchant-owned custom content do not output reveal hooks by default.
- No-JS, reduced-motion, motion-disabled, Theme Editor, and first-viewport reveal guards are handled by the shared reveal chain.

Current rule:

- Do not restore GSAP, `Motion.*`, `motion-transition`, legacy motion recipe classes, scattered hover zoom, or scattered `x-transition:*`.
- Components and sections should emit semantic motion hooks only.
- `tailwind/tailwind.animates.css` owns the visual motion behavior.
- Scattered visual motion that bypasses the global data chain should be removed or connected to the chain.
- Functional UI feedback may remain when it is not part of the visual motion language.

### Next Session Entry

Motion cleanup is focused on the current chain, not old animation compatibility.

1. Continue removing visual motion that bypasses the global `data-*` -> `tailwind.animates.css` chain.
2. Image/media primitives output `data-motion-reveal="media"` as an internal semantic hook by default; do not expose this as an external parameter.
3. Do not add hover-motion compatibility parameters or restore scattered hover zoom.
4. Preserve functional interaction feedback only when it is clearly not part of the visual motion language.
5. Preserve completed-domain visual checks for final launch regression.

### Deferred Cross-Phase Items

- Toasts: warning toast uses `icon-info-circle` (no dedicated warning icon). Record only.
- Toasts: no global dedup or max-stack logic implemented. Documented as intentional;
  re-evaluate only if user reports stacking issues.
- Buttons (completed-domain follow-up): `BuyButtons.buttonText` getter and
  `buy-buttons.liquid` template fallback text contain hardcoded English. Verify
  and fix during final launch regression.
- Focus (resolved): `overflow: hidden` on `.product-card-shell` clips focus outlines
  on internally-focusable controls. Classified as structural constraint (image rounding
  requires overflow clipping). Acceptable; verify visually during final launch regression.
- Focus (resolved): Toast dismiss button now uses shared `focus-ring` utility. Manual
  keyboard check deferred to final launch regression.
- Search / Motion: `hover:shadow-sm` on predictive-search overlay cards is an
  intentional interactive enhancement. Re-evaluate during Search or Motion phase
  if global shadow opacity > 0 creates a visual conflict.
- Final visual regression: product card shadow clipping in header horizontal-scroll
  (`overflow-x-auto`) and Swiper (`overflow: hidden`) containers is a CSS layout
  constraint, not a code bug. Verify visually during final launch regression.
- Final architecture regression: audit parameters and component fields changed from
  hardcoded user-visible defaults to empty-string defaults across all completed
  phases. For each empty default, verify that every consumer supplies the value
  through the intended Liquid `data-*` chain. Keep the empty default only when it is
  a deliberate safe fallback; otherwise remove unused parameters/fields or restore
  a properly localized required default. Also verify that missing data cannot cause
  important success, error, validation, or accessibility feedback to fail silently.
- Architecture: unified z-index/layer hierarchy. Current z-index values are scattered
  across inline styles, Tailwind arbitrary classes, and component CSS. Establish a
  dedicated layer system covering Header, Announcement Bar, dropdown, Toast, Dialog,
  drawer, modal, and lightbox. Toast currently uses `z-10140` as a phased fix to sit
  above the Announcement Bar (`z-index: 9999`) and Header/drawers (`z-[10010]`).
  Whether `z-10140` covers the lightbox root layer (`z-10120`) is an incidental
  outcome of the phased fix, not an intentional override; defer to unified z-index
  architecture.

### Definition Of Done

- Every approved global setting in the current phase has a clear and effective storefront consumer.
- Local overrides in sections and snippets have been confirmed as intentional or cleaned up.
- No unrelated setting-domain refactors are mixed into the phase.
- Existing storefront logic and presentation have no unintended regressions.
- Applicable validation and storefront regression checks for the phase have passed.
