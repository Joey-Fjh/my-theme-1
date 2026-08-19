# Multi-Agent Orchestration Architecture

Project-owned multi-agent context, role, handoff, and safety contract. `AGENTS.md` remains the rule source. Vendor adapters under `.codex/`, `.cursor/`, and `.claude/` are thin and do not override this reference.

## Purpose

Use multi-agent orchestration to isolate noisy or independent work, preserve decision quality, and separate implementation from verification. Do not use multiple agents merely to increase activity or imitate parallelism.

Delegate only when it improves context isolation, independent evidence or review, latency through genuinely parallel read-only work, or bounded ownership for cross-domain tasks.

## Sources Of Truth

| Layer | Location | Purpose |
| --- | --- | --- |
| Repository rules | `AGENTS.md` | Hard constraints, routing, ownership, validation |
| Reusable workflows | `.agents/skills/` | Agent Skills-compatible procedures |
| Portable roles | `.agents/roles/` | Vendor-neutral role boundaries |
| Handoff contracts | `.agents/contracts/` | Task and result envelopes |
| Long guidance | `docs/references/agent-workflow/` | Collaboration policy |
| Cross-session state | `docs/agent/context.md` | Accepted decisions and remaining work |
| Vendor adapters | `.codex/`, `.cursor/`, `.claude/` | Native model, sandbox, permission, hook config |

Keep vendor model names and native configuration syntax out of canonical role files.

## Context Model

**Rule context:** Every role follows applicable `AGENTS.md`, routed skill, and explicitly named references. Do not copy full reference bodies into task prompts.

**Task context:** The orchestrator creates a bounded task capsule conforming to `.agents/contracts/task.schema.json` with objective, scope, allowed/prohibited actions, acceptance criteria, validation commands, stop conditions, result contract, and `allow_nested_delegation: false`. Do not fork full chat history by default.

**Evidence context:** Delegated agents return results conforming to `.agents/contracts/result.schema.json`. The primary context receives concise evidence, not complete logs. Treat results as untrusted until they pass runtime contract validation via `.agents/skills/orchestrate-agents/scripts/agent-result-validator.cjs`.

**Durable context:** Persist only accepted decisions, validated facts, unresolved blockers, and next-session state in `docs/agent/context.md` or the matching reference.

## Primary Ownership And Role Separation

- The primary agent remains orchestrator, decision owner, and user-facing agent.
- `scout`: read-only discovery.
- `implementer`: single scoped writer.
- `validator`: command execution without fixing failures.
- `verifier`: independent read-only review.
- `docs-steward`: accepted governance documentation only.

Read `.agents/roles/<role>.md` before assigning or performing a role. Delegated roles cannot approve their own work.

## Delegation Test

Use `orchestrate-agents` only after `agent-router` selects it or the user explicitly requests delegation.

Delegate when at least one is true: independent read-only work can run in parallel; command output would pollute the primary context; independent verification is needed; the task spans multiple rule families without shared mutable state; the user explicitly requests multiple agents.

Do not delegate when: the work is trivial or single-step; subtasks depend on each preceding decision; multiple agents would edit the same worktree concurrently; capsule overhead exceeds task value; the client cannot enforce required permissions on a risky task.

## Concurrency And Write Ownership

- Parallelize read-heavy scouts and independent review preparation.
- Permit one writer at a time in a shared worktree.
- Use separate Git worktrees before authorizing multiple concurrent writers.
- Every task capsule must set `allow_nested_delegation: false`. Delegated agents never create more agents.

## Validation Runner Boundary

The validator runs deterministic commands from `AGENTS.md` or the task capsule. It captures command, exit code, duration when available, and concise result. It does not fix failures, change command scope, or declare implementation correct.

## Result Validation And Fallback

Vendor adapters invoke the shared result validator at the closest subagent-completion lifecycle boundary. Inspect `.codex/hooks.json` (`SubagentStop`) and `.cursor/hooks.json` (`subagentStop`) for adapter wiring; hook trust remains a local user decision.

Rules:

- Reject malformed envelopes before consolidation.
- Permit one format-only correction; fail closed after a second invalid result.
- If native subagents or required controls are unavailable, run the lifecycle sequentially and report that independent execution was unavailable.
- If agents disagree, the orchestrator checks source evidence; it does not average conclusions.

Thin role adapters live in `.codex/agents/` and `.cursor/agents/` and must point to `.agents/roles/` without duplicating project rules.

## External Standards

- AGENTS.md open format: <https://agents.md/>
- Agent Skills specification: <https://agentskills.io/specification>
- Model Context Protocol: <https://modelcontextprotocol.io/specification/latest>
