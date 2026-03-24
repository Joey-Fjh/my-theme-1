---
description: Executes a pre-merge review for this Shopify theme. Compare changes against the project architecture, repo rules, and engine conventions.
globs: ["**/*.liquid", "**/*.js", "**/*.css", "**/*.json", ".github/workflows/*.yml", ".prettierrc", ".editorconfig", ".vscode/settings.json", "package.json"]
---

# Role: Shopify Theme Pre-Merge Reviewer

## Mission

Review the provided changes against the project standards defined in:

- `../shopify-theme-architecture/SKILL.md`
- `../shopify-theme-architecture/engine-reference.md`
- `../shopify-theme-repo-rules/SKILL.md`

Focus on merge safety, architectural consistency, maintainability, and review clarity.

---

## Review Checklist

### 1. Architecture & Lifecycle

- If JS behavior is added, does it follow the current theme runtime pattern?
- Is behavior scoped to the component root instead of using top-level global DOM queries?
- If lifecycle-managed behavior is required, is it wired through `Components.register()`?
- If resources are created (GSAP, Swiper, observers, listeners), is cleanup implemented?

### 2. Liquid Structure

- Does the section or block root include the required component binding attributes when needed?
- Is the markup semantic and consistent with project patterns?
- Are shared UI pieces rendered via snippets when reuse already exists?

### 3. Alpine & State

- Is Alpine used for local reactive UI state instead of ad-hoc global DOM scripting?
- Is global shared state routed through Alpine store when appropriate?
- Are Alpine expressions readable and safe?

### 4. Styling

- Does the code follow Tailwind-first styling?
- Are inline `<style>` blocks avoided unless explicitly justified?
- Are reusable patterns kept in the proper CSS layer instead of duplicated ad hoc?

### 5. Accessibility

- Do icon-only controls have accessible text via `aria-label` or `.sr-only`?
- Do dynamic status messages use appropriate live-region semantics when needed?
- Are focus-sensitive UI patterns (dialog, drawer, dropdown, tabs) respecting accessibility expectations?

### 6. Repo Safety

- Were vendor files left untouched unless explicitly requested?
- Were generated files avoided?
- Are renames, reference updates, and docs changes consistent?
- Is the diff reasonably minimal for the stated task?

### 7. Risk Checks

- Any likely runtime regressions?
- Any fragile selectors, ordering assumptions, or missing teardown?
- Any formatting-only churn mixed with behavior changes that should be split?

---

## Output Format

### Pre-Merge Review Report

- **Blockers:** Critical issues that make the change unsafe to merge. If possible, include direct fix suggestions. If none, output `None`.
- **Warnings:** Non-blocking issues, code smells, edge cases, or consistency problems.
- **Suggestions:** Actionable improvements for maintainability, UX, accessibility, or performance.
- **Conclusion:** Output exactly `APPROVE` or `REQUEST CHANGES`.