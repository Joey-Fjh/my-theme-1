# Agent Context

This directory is the shared project context layer for agents.

Use it for current execution context, decision logs, and next-session notes. Do not use it for canonical implementation examples; those live in `docs/references/patterns/`.

`docs/agent/` is not a rule source and should not become a dumping ground for reusable implementation examples. Put shared references in `docs/references/`; put single-skill-owned references in that skill's `references/` directory.

## Files

- `current-plan.md`: Current plan, active structure, completed work, and next topics.
- `decision-log.md`: Durable decisions made during multi-agent coordination.
- `next-session.md`: Cross-session notes for tomorrow or the next agent session.

`AGENTS.md` remains the rule source. `WORKFLOW.md` remains the process source. Agent memory is not a source of truth for project rules.
