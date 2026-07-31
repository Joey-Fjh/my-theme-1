---
name: orchestrate-agents
description: Orchestrate bounded multi-agent project work with isolated context, explicit roles, structured handoffs, and independent verification. Use after agent-router for broad audits, parallel read-heavy discovery, noisy command output, cross-domain work, or changes that benefit from separating implementation and review. Do not use for trivial, single-step, or tightly coupled work.
---

# Orchestrate Agents

Use this skill as the multi-agent execution dispatcher after `agent-router` selects it. Keep project authority in `AGENTS.md` and detailed policy in the architecture reference.

## Required Reference

Read `docs/references/agent-workflow/multi-agent-architecture.md` completely before delegating.

## Workflow

1. Confirm that delegation meets the architecture reference's delegation test.
2. Keep the primary agent as orchestrator and final decision owner.
3. Create one bounded task capsule per delegated role using `.agents/contracts/task.schema.json`.
4. Give each agent only the task-local context, files, rules, permissions, and acceptance criteria it needs.
5. Parallelize independent read-only work. Keep write-heavy or dependent work sequential.
6. Allow only one writer in a shared worktree.
7. Require every delegated result to map to `.agents/contracts/result.schema.json` and pass the shared runtime validator when the active client can invoke it.
8. Reject an invalid result and allow one format-only correction attempt. Treat a second invalid result as blocked; do not silently repair it in the primary context.
9. Consolidate evidence and resolve disagreements before implementation or completion claims.
10. Use the project validation route for the changed domain. Passing commands do not replace independent review or owner gates.
11. Persist only accepted decisions and durable remaining work in the matching project reference or `docs/agent/context.md`.

## Role Selection

- `scout`: read-only discovery and evidence collection.
- `implementer`: the single scoped writer for approved code or documentation changes.
- `validator`: command execution and result capture without fixing failures.
- `verifier`: independent read-only review of claims, diffs, and evidence.
- `docs-steward`: accepted documentation, role, contract, and skill maintenance.

Read the matching `.agents/roles/<role>.md` before assigning or performing that role. The orchestrator role is defined in `.agents/roles/orchestrator.md`.

## Guardrails

- Do not pass full conversation history when a task capsule is sufficient.
- Do not return raw logs to the primary context when a concise evidence summary and artifact reference are enough.
- Do not let delegated agents expand scope, approve their own work, or change merchant-owned content without explicit authorization.
- Do not let delegated agents create more agents. The initial task contract requires `allow_nested_delegation: false`.
- Do not treat prompt compliance as runtime validation. Use `scripts/agent-result-validator.cjs` through the active vendor adapter when lifecycle hooks are available.
- Do not use multiple agents merely to imitate parallelism; use them only when context isolation, independence, or latency provides material value.

## Fallback

If the active client cannot create subagents or enforce the requested role boundary, run the same state machine sequentially in the primary thread. Report that independent or parallel execution was unavailable; do not claim independent verification.
