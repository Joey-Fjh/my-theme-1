# Launch Readiness Gate

Use this checklist before treating a theme as ready for production or as a reusable skeleton baseline.

## Required Commands

Run locally before final review:

```bash
npm run lint
npm run test
npm run build:tw
```

`npm run test` depends on Shopify Theme Check. If the Shopify CLI or store context is unavailable, record that limitation in the handoff.

## Lighthouse Target

All four Lighthouse categories must be **95 or higher** on the production-like preview URL:

| Category | Minimum score |
| --- | --- |
| Performance | 95 |
| Accessibility | 95 |
| Best Practices | 95 |
| SEO | 95 |

Test at least:

1. Home page
2. Collection page
3. Product page
4. Cart page or cart drawer flow
5. Search page or predictive search overlay when enabled

## Blockers

Fix before launch:

- Cart add/change/checkout flow is broken.
- JavaScript errors appear during core browsing, cart, search, filters, or product variant changes.
- Lighthouse category score is below 95 on a core page.
- Missing accessible names on interactive icon controls.
- Drawer, dialog, search, tabs, or menus cannot be used by keyboard.
- Product, collection, or article pages are missing critical title/meta content.
- Images above the fold are too large, lazy-loaded incorrectly, or missing dimensions.
- Raw app-code `fetch()`, direct cart endpoints, or manual section HTML replacement bypass project infrastructure.
- Locale keys are missing or merchant-facing schema text is hardcoded.

## Warnings

Warnings may ship if documented and not affecting Lighthouse or conversion-critical flows:

- Redundant default typography classes such as unnecessary `body-md`.
- Minor CSS layer inconsistency with no visual or maintainability risk.
- Non-critical animation polish.
- Cleanup-only refactors that can safely wait for the next skeleton iteration.

## Lighthouse 95+ Triage Order

When scores miss the target, triage in this order:

1. **Performance**: hero image sizing, critical CSS, unused JS, third-party scripts, lazy loading, layout shift, font loading.
2. **Accessibility**: button/link names, contrast, focus order, form labels, dialog semantics, keyboard navigation.
3. **Best Practices**: console errors, image aspect ratio, HTTPS assumptions, deprecated APIs, source map or security warnings.
4. **SEO**: title, meta description, canonical URL, crawlable links, heading structure, alt text, structured content.

## Handoff Format

Every launch-readiness review should end with:

```text
Lint: pass/fail
Theme Check: pass/fail/not run
Tailwind Build: pass/fail
Lighthouse Home: P/A/BP/SEO
Lighthouse Product: P/A/BP/SEO
Lighthouse Collection: P/A/BP/SEO
Launch blockers: none/list
Post-launch debt: none/list
Conclusion: GO / NO GO
```
