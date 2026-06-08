# Agent Context

This is a user-maintained working notebook. Agents read it on demand when the user asks to continue previous work, review outstanding tasks, or prepare next-session context. Updates are manual; agents do not auto-update this file.

- `Next Topics`: actionable items tracked across sessions. Mark done items as done or remove them; add new items as they arise.
- `Next Session Template`: fill in before ending a session if the user asks for next-session context.

## Next Topics

- Review root entry points and confirm only agent entry adapters remain at the repository root.
- Review `agent-router` and the routing docs after real usage; then decide whether repeated docs references should become skills.
- Smoke-test tool adapter symlink resolution and confirm Claude reads `CLAUDE.md` and `.claude/skills`.
- Confirm CI runs `npm run lint` in GitHub after the branch is pushed.
- Plan MCP configuration for Shopify Dev MCP, Playwright MCP, Figma MCP, and Chrome DevTools MCP in a separate pass under tool-owned config directories.
- Decide whether to add optional skill UI metadata later; do not do it unless it clearly helps discovery.
- Global settings: candidate settings remain reserved in `config/settings_schema.json` and `locales/en.default.schema.json`; do not connect them to storefront runtime until each setting group and its behavior contract are explicitly approved.
- Global typography: the approved settings panel and base mapping chain are complete: settings -> `snippets/css-variables.liquid` -> `assets/base.css` / `tailwind/tailwind.typography.css` -> storefront inheritance and typography tiers. Heading and body family, weight, line height, letter spacing, text transform, and scale are mapped; scale affects font size only.
- Global typography review: continue with human-led, file-by-file review. For each file, decide whether local `font-*`, `leading-*`, `tracking-*`, text-transform, `.h*`, and `.body-*` classes are intentional overrides or redundant declarations. Do not batch-delete or infer intent from repetition alone.
- Global typography review: do not introduce new feature- or component-specific typography combination classes by default. Keep the existing global defaults and typography tiers; record shared components, uncertain design choices, and skipped files for later decisions.
- Global typography follow-ups: review `.rte`, language/font fallback behavior, RTL support, and exceptional component typography as separate scoped decisions rather than mixing them into the file-by-file cleanup.

## Next Session Template

Fill in before ending a session if the user asks for next-session context. Each field:

- Current state:
- Objective:
- Files changed:
- User decisions:
- Checks run:
- Known blockers:
- Next recommended prompt:
