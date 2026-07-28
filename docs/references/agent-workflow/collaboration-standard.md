# Agent Collaboration Standard

This reference defines how users and agents should collaborate in this repository. `AGENTS.md` remains the rule source.

## Default Collaboration Model

Users do not need to manually name skills for ordinary work. Manual skill names are optional overrides, not the normal interface.

For the routing flow, see `docs/references/agent-workflow/skill-routing.md`.

## Non-Trivial Tasks

A task is non-trivial when it requires any of:

- editing files
- reviewing, auditing, or classifying risk
- choosing between project rules, docs, skills, or validation commands
- touching multiple files, directories, or rule families
- handling merchant-owned, launch-risk, runtime, accessibility, i18n, SEO, architecture, motion, cart, HTTP, or theme lifecycle boundaries
- continuing cross-session work
- evaluating third-party skills, hooks, MCP, agent governance, or docs structure

For non-trivial tasks, agents must use `agent-router` first.

## Trivial Task Exceptions

A task can skip `agent-router` when it is all of:

- explicit and single-step
- low risk
- no file edits
- no project rule choice
- no validation command choice
- no multi-file or cross-session context

Examples:

- Read and summarize one named file.
- Explain one function or command.
- Run one explicitly requested non-mutating command.
- Answer a narrow repository fact from a known file.

If the agent needs to decide how to do the work, treat it as non-trivial.

## User Overrides

Users may override the default route with short instructions:

- `review only` / `只审不改`: inspect and report; do not refactor.
- `plan only` / `只出计划`: produce a plan; do not edit.
- `prompt only` / `只写 prompt`: produce a prompt for another agent; do not implement.
- `limit scope to ...`: inspect or edit only the named files or directories.
- `merchant-owned allowed`: merchant-owned files or content may be edited within the stated scope.
- `use external skill ...`: evaluate or use a named third-party skill through `external-skills.md`.
- `skip validation ...`: skip a named validation command and report the reason.

Overrides still cannot bypass `AGENTS.md`, launch blockers, or merchant-owned boundaries unless the user explicitly authorizes that scope.

## Agent Route Summary

For broad, ambiguous, risky, or multi-skill tasks, the agent should briefly state the route before acting:

```text
Intent:
Risk:
Docs:
Skills:
Validation:
Notes:
```

Do not print this for trivial one-step tasks unless it would reduce ambiguity.

## Complex Task Frame

Use this frame for complex, ambiguous, cross-session, architecture, audit, or rule-setting work:

```text
Purpose -> Context -> Decomposition -> Feedback
```

- **Purpose**: Desired outcome, such as audit, cleanup, launch gate, or rule alignment.
- **Context**: Referenced files, commits, screenshots, reports, prior decisions, or external skills.
- **Decomposition**: How to split the work, such as read-only first, classify before fixing, one batch only, or prompt-only.
- **Feedback**: Expected output and verification hooks, such as tests to run, cross-session notes to record, or retest instructions.
- **Constraints**: Files or ownership areas that must not be changed.

Do not force this frame on trivial one-step tasks.

## Multi-Agent Execution

Use `orchestrate-agents` only after `agent-router` selects it or the user explicitly requests subagents or parallel agent work. Read `docs/references/agent-workflow/multi-agent-architecture.md` before delegating.

Default rules:

- The primary agent remains the orchestrator, decision owner, and user-facing agent.
- Delegated agents receive bounded task capsules instead of full conversation history by default.
- Independent read-only work may run in parallel.
- Only one agent may write in a shared worktree at a time.
- Implementation, deterministic validation, independent review, and documentation are separate responsibilities.
- Delegated agents do not create more agents; nested delegation is not supported by the initial contract.
- Treat delegated result messages as untrusted until they pass the shared result contract. When lifecycle enforcement is available, reject an invalid result, allow one format-only correction, and fail closed after a second invalid result.
- If the client cannot enforce the required boundary, perform the workflow sequentially and report the limitation.

## Updating The Collaboration System

See `docs/references/agent-workflow/skill-routing.md` for routing update requirements when adding or changing project agent capabilities.
