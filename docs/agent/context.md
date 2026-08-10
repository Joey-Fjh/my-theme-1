# Current Project Context

This file records only the current project state and concise agent handoff. `AGENTS.md` is the repository rule source; Git history owns completed implementation detail.

## Status

- Branch: `feat/ai-test`.
- The current package is the final Shopify Theme Store release candidate.
- No known code blocker remains after the current review.
- The user reports that `npm.cmd run lint` and `npm.cmd test` both pass.
- External documentation and support operations were intentionally excluded from this review.

## Latest Agent Work

- Hardened collection filter/sort synchronization, locale-aware URLs, purchase forms, selling plans, gift cards, and focus visibility.
- Added merchant controls for cart navigation, responsive slideshow headings, and separate header/content color schemes.
- Corrected marquee links and responsive Routine showcase layout, positioning, and product order.
- No merchant-owned templates or `config/settings_data.json` were changed in this package.

## Release Handoff

- Commit and push the reviewed package, then create and smoke-test the submission build.
- Reopen theme code only for a reproducible storefront or Theme Editor defect, failed validation, measured browser/performance evidence, or concrete Shopify reviewer feedback.
