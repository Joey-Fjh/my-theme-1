# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-06.

## Batch 6-V1: lint Tailwind functions in Liquid stylesheets

**Status:** authorized (2026-10-06); implemented by the coordinator; committed on the user's "提交" without the Ask review run (user decision, 2026-10-06).

### Outcome

- **Check.** `collectStylesheetDirectiveFailures` (`.agents/skills/check-theme-architecture/scripts/lib/theme-contracts.js`, check ID `stylesheet-directive`) also fails on a Tailwind function call inside a `{% stylesheet %}` block: `theme(`, `--spacing(` or `--alpha(`.
    - The match is `(?<![\w-])(?:theme|--spacing|--alpha)\(`, so `var(--spacing-…)`, `var(--spacing)` and custom properties such as `--theme-y` pass.
    - These functions compile only in `tailwind/*.css`; in a Liquid stylesheet the browser drops the whole declaration or media block.
    - **Recurrences:** 6-S6 (`scroll-categories` panels) and 6-S12 R1 (the `featured-product` desktop grid).
- **Tests.** `theme-architecture.test.js` gains four cases:
    - `theme(--breakpoint-pc)` in a media query fails;
    - `--spacing(4)` fails;
    - `--alpha(...)` fails;
    - `var(--spacing-gap-md)`, `var(--alpha-x)`, `--theme-y` and `calc(var(--spacing) * 4)` pass.
- **Reference.** `docs/references/style-system/css-architecture.md` (rule 1, "Plain CSS in `{% stylesheet %}`") names the Tailwind functions next to the directives and says `lint:theme` rejects both.

### Implementation surface

- `.agents/skills/check-theme-architecture/scripts/lib/theme-contracts.js`
- `.agents/skills/check-theme-architecture/scripts/theme-architecture.test.js`
- `docs/references/style-system/css-architecture.md` (one sentence)

### Review tier

**Ask.** The batch changes validator wiring, which the user owns; the user authorized it.

### Acceptance checks

- `npm.cmd run test:theme-architecture` passes, including the new cases.
- `npm.cmd run lint:theme` passes on the current theme.
- A temp fixture with `@media (width >= theme(--breakpoint-pc))` fails `lint:theme` with the new message.
- `npm.cmd run lint:doc-paths` and `npm.cmd run doctor:agent` pass.

### Execution (coordinator, 2026-10-06)

| Check                      | Result                                   |
| -------------------------- | ---------------------------------------- |
| `test:theme-architecture`  | 159 tests pass, including the 4 new ones |
| `test:validators`          | All suites pass (32 / 159 / 3 / 7)       |
| `lint:theme`               | Passes on the theme                      |
| `lint:doc-paths`           | Passes                                   |
| `doctor:agent`             | Exits 0                                  |
| Prettier, the two JS files | Passes                                   |

`css-architecture.md` shows a Prettier warning under an explicit check, but its HEAD version warns the same way, and `docs/` is outside the repository's Prettier scope.
