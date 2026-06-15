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
| Motion | Verify motion settings reach CSS/runtime policy, shared recipes, GSAP/Swiper consumers, reduced-motion handling, and no-JS visibility. | Connect shared motion variables and recipes; remove duplicate or conflicting choreography; keep critical content visible without animation completion. | `npm run lint:theme`; test reduced motion, no-JS/failed-init visibility, lifecycle cleanup, and responsive behavior. |
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

Toasts

### Final Regression Checks

- Colors: visually verify password-page 20% borders, solid-color password header and
  footer chrome, merchant-configured product-comparison colors on dark schemes, toast
  contrast, dark-scheme loading overlay, and pagination current-page distinction.

### Next Session Entry

1. Begin the Toasts phase by closing the global toast settings chain through the
   shared toast contract.
2. Audit toast emitters, placement, states, and message ownership before deciding
   which overrides are intentional.
3. Preserve completed-domain visual checks for final launch regression.

### Deferred Cross-Phase Items

- Focus: `overflow: hidden` on `.product-card-shell` may clip focus outlines on
  internally-focusable controls. Resolve during Focus phase.
- Search / Motion: `hover:shadow-sm` on predictive-search overlay cards is an
  intentional interactive enhancement. Re-evaluate during Search or Motion phase
  if global shadow opacity > 0 creates a visual conflict.
- Final visual regression: product card shadow clipping in header horizontal-scroll
  (`overflow-x-auto`) and Swiper (`overflow: hidden`) containers is a CSS layout
  constraint, not a code bug. Verify visually during final launch regression.

### Definition Of Done

- Every approved global setting in the current phase has a clear and effective storefront consumer.
- Local overrides in sections and snippets have been confirmed as intentional or cleaned up.
- No unrelated setting-domain refactors are mixed into the phase.
- Existing storefront logic and presentation have no unintended regressions.
- Applicable validation and storefront regression checks for the phase have passed.
