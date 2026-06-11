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
- Do not force shared abstractions. Reuse or extract only when consumer contracts and invariants match.
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

### Completed Domains

- Layout: `page_width`, `page_margin`, `section_margin_top`, and `section_margin_bottom` are connected and currently working. Do not reopen Layout as a cleanup phase unless a concrete regression is found; verify it only during final launch regression.

### Known Phase-Owned Chain Findings

- Product cards: structural settings reach `--product-card-*` CSS variables, but the variables are not yet connected to shared product-card styles. Handle this during the Product cards phase.
- Motion: `motion_speed` reaches `--motion-duration`, and `--motion-ease` is defined, but neither variable is connected to shared motion recipes or runtime policy. Handle this during the Motion phase.

### Per-Phase Workflow

1. Confirm the global settings and intended behavior contract for the current domain.
2. Verify the complete chain from settings to variables or runtime policy, shared primitives, and storefront consumers.
3. The Agent audits and provides classified, file-by-file recommendations.
4. The user reviews and implements the approved changes.
5. Verify the current phase and record deferred or cross-phase findings.
6. Move to the next phase only after explicit confirmation.

### Current Phase

Typography

### Definition Of Done

- Every approved global setting in the current phase has a clear and effective storefront consumer.
- Local overrides in sections and snippets have been confirmed as intentional or cleaned up.
- No unrelated setting-domain refactors are mixed into the phase.
- Existing storefront logic and presentation have no unintended regressions.
- Applicable validation and storefront regression checks for the phase have passed.
