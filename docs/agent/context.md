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

## Next Session Template

Fill in before ending a session if the user asks for next-session context. Each field:

- Current state:
- Objective:
- Files changed:
- User decisions:
- Checks run:
- Known blockers:
- Next recommended prompt:
