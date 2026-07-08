# CSS Architecture History And Deferred Notes

This file stores historical CSS architecture decisions and deferred cleanup notes. Current CSS contracts live in `docs/references/style-system/css-architecture.md`.

## Accepted Architecture State

- Token source and Tailwind bridge contract are established.
- Layer ownership is established across base, typography, elements, components, snippets, utilities, and animates.
- Lint governance exists through `npm.cmd run lint:theme` and the `check-theme-architecture` skill scripts.
- Snippet CSS owner blocks are accepted; do not reintroduce snippets.css as a pattern dump.
- PDP product component API, product-price primitive, buy-buttons purchase row, and title typography ownership are accepted.
- Image display contract is mature and lives in `image-display-contract.md`.

## Historical Milestones

| Area | Accepted outcome |
| --- | --- |
| Motion token chain | Primary interactive paths use motion vars; remaining gaps are low-priority governance or drive-by cleanup |
| Section override cleanup | Section-root selectors do not belong in `components.css` |
| Typography drift | Legacy `.sub-heading` retired; subtitle consumers use `typo-subtitle` + explicit size tier |
| Tab trigger chrome | Shared trigger chrome consolidated under reusable tab-nav API |
| Accordion | Accordion CSS promoted to components; snippet remains render/API owner |
| Link micro-pattern | Shared focus/underline behavior belongs in elements utility or existing link primitive |
| Icon-with-text item | Reusable item CSS promoted; section-specific carousel/grid remains local |
| Buy-buttons chrome | Shared purchase chrome promoted; pickup/quick-view/PDP deltas stay with their owners |
| Style API hardening | Dead `layout: 'stack'` branch removed; product-price primitive extracted; PDP context naming aligned |

## Deferred Notes

- `--form` / `--featured` modifier visual audit remains optional.
- PDP empty-product placeholder heading semantics remain a low-risk note.
- Product-card dual BEM ergonomics and wider Liquid extraction should wait for evidence of repeated stable consumers or API drift.
- Link/card hover vocabulary is not yet fully unified; migrate when scoped with interaction design work.
- New lint rules should target stable, machine-detectable contracts only.

## Maintenance Rules

- Keep this file as a summary, not a phase diary.
- Do not paste full review logs or QA tables here; link to the relevant task artifact if needed.
- If a historical decision becomes an active rule, move the concise rule to `css-architecture.md` or another current contract reference.
