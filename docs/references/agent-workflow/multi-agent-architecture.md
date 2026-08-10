# Multi-Agent Orchestration Architecture

This reference defines the project-owned multi-agent context, role, handoff, and safety contract. `AGENTS.md` remains the repository rule source. Vendor-specific files are adapters and do not override this reference.

## 1. Purpose

Use multi-agent orchestration to isolate noisy or independent work from the primary context, preserve decision quality, and separate implementation from verification. Do not use multiple agents merely to increase activity or imitate parallelism.

The orchestration system must improve at least one of:

- context isolation;
- independent evidence or review;
- latency through genuinely parallel read-only work;
- bounded ownership for complex, cross-domain tasks.

## 2. Sources Of Truth

The project uses these layers:

| Layer | Canonical location | Purpose |
| --- | --- | --- |
| Repository rules | `AGENTS.md` | Hard constraints, routing, ownership, and validation |
| Reusable workflows | `.agents/skills/` | Open Agent Skills-compatible procedures |
| Portable roles | `.agents/roles/` | Vendor-neutral role responsibilities and boundaries |
| Handoff contracts | `.agents/contracts/` | Machine-readable task and result envelopes |
| Long guidance | `docs/references/agent-workflow/` | Architecture and collaboration policy |
| Cross-session state | `docs/agent/context.md` | Accepted decisions and remaining project work |
| Vendor adapters | `.codex/`, `.cursor/`, `.claude/`, and other tool-owned directories | Model, sandbox, permission, and native agent configuration |

Keep vendor model names and native configuration syntax out of canonical role files. A vendor adapter maps a capability profile to the models and controls available in that client.

Cursor discovers `.agents/skills/` directly, so it does not need a `.cursor/skills/` copy or symlink. Keep `.cursor/agents/*.md` as real, thin adapter files because their native frontmatter differs from the canonical role contract and project-level agent symlink behavior is not guaranteed. Each adapter points to `.agents/roles/`; the Cursor hook adapter points to the shared validator instead of copying validation logic.

## 3. Context Model

### 3.1 Rule Context

Every role follows the applicable `AGENTS.md`, routed skill, and explicitly named project references. Do not copy full reference bodies into task prompts.

### 3.2 Task Context

The orchestrator creates a task capsule conforming to `.agents/contracts/task.schema.json`. It contains only:

- the delegated objective;
- included and excluded scope;
- required inputs and stable context version;
- allowed and prohibited actions;
- acceptance criteria and validation commands;
- stop conditions and result contract;
- the explicit `allow_nested_delegation: false` boundary.

Do not fork full chat history by default. Pass the minimum recent context only when a task capsule cannot represent a required interaction or user decision.

### 3.3 Evidence Context

Delegated agents return results conforming to `.agents/contracts/result.schema.json`. The primary context receives concise evidence, not complete logs or broad file dumps. Store or retain raw artifacts only when they are needed to reproduce a result.

Treat a result as untrusted until it passes runtime contract validation. The shared validator lives at `.agents/skills/orchestrate-agents/scripts/agent-result-validator.cjs` and verifies JSON syntax, the full result schema, the delegated role, and its expected output contract.

The initial Codex adapter uses a project `SubagentStop` hook from `.codex/hooks.json`. It validates `last_assistant_message`, permits one format-only correction when invalid, and fails closed when the corrected result remains invalid. The hook validates structure, not the truth of claims; validators and verifiers still provide evidence checks. Project hook configuration is shared through Git, while hook trust remains a local user decision.

The Cursor adapter uses the native `subagentStop` hook from `.cursor/hooks.json`. It resolves the expected role from the custom-agent type, the parent-owned task capsule, or an explicit `[project-role:<role>]` task-description marker, validates `summary`, permits one `followup_message` format correction, and exits closed after a second invalid result. The marker is the fallback when the active Task API exposes only built-in subagent types. The adapter also normalizes the JSON fragment observed from Cursor's Windows temp-file hook runner before invoking the shared validator. Cursor does not currently document a separate raw final-message field or guarantee the custom-agent type encoding, so this is the closest available lifecycle boundary. If runtime evidence shows that the summary is transformed, the orchestrator must explicitly validate the returned envelope or run the lifecycle sequentially. Cursor project hooks also require local trust.

### 3.4 Durable Context

Persist only accepted decisions, validated facts, unresolved blockers, and next-session state. Do not persist exploratory notes, duplicated command output, or rejected hypotheses.

## 4. Task State Machine

Use this lifecycle:

```text
DISCOVER
  -> PLANNED
  -> IMPLEMENTING
  -> VALIDATING
  -> REVIEWING
  -> OWNER_REVIEW
  -> ACCEPTED
  -> DOCUMENTED
```

State ownership:

- The orchestrator owns the overall state and user communication.
- A scout may complete discovery but cannot approve a plan.
- An implementer may complete scoped edits but cannot approve its own work.
- A validator may prove command outcomes but cannot prove runtime or owner acceptance.
- A verifier may recommend acceptance or changes but does not edit.
- A docs steward records only accepted state.

If a task does not require every state, the orchestrator may omit inapplicable states but must not skip a required validation, review, merchant-ownership, or owner gate.

## 5. Roles

| Role | Capability profile | Default access | Primary output |
| --- | --- | --- | --- |
| Orchestrator | `frontier` | Parent session | Decisions and consolidated result |
| Scout | `economy` | Read-only | Evidence report |
| Implementer | `balanced` | Scoped workspace write | Implementation result |
| Validator | `economy` | Parent-approved commands | Validation result |
| Verifier | `frontier` | Read-only | Independent review result |
| Docs steward | `balanced` | Scoped governance write | Documentation result |

Read the complete role contract in `.agents/roles/` before assigning or performing a role.

The task and result schemas cover delegated roles only. The primary orchestrator owns the envelopes and therefore is intentionally absent from their `role` enums.

## 6. Delegation Test

Use `orchestrate-agents` only after `agent-router` selects it or the user explicitly requests delegation.

Delegate when at least one condition is true:

- two or more independent read-only investigations can run in parallel;
- command output, logs, or source inventories would materially pollute the primary context;
- implementation requires an independent verifier;
- the task spans multiple rule families and can be divided without sharing mutable state;
- the user explicitly requests multiple agents or parallel agent work.

Do not delegate when any condition is true:

- the work is trivial, single-step, or limited to one narrow fact;
- the subtasks depend on each preceding decision;
- multiple agents would need to edit the same worktree concurrently;
- creating task capsules and reconciling results costs more than the task;
- the active client cannot enforce the required permissions and the task is risky.

## 7. Concurrency And Write Ownership

- Parallelize read-heavy scouts, targeted research, and independent review preparation.
- Permit one writer at a time in a shared worktree.
- Do not run a docs steward concurrently with an implementer when their allowed files overlap.
- Use separate Git worktrees before authorizing multiple concurrent writers.
- The initial Codex adapter permits at most three concurrent subagent threads in addition to the primary agent.
- Cursor has no project adapter setting equivalent to the Codex thread limit, so the orchestrator must keep Cursor delegation to at most three concurrent child tasks.
- Delegated agents never create more agents in the initial implementation. Every task capsule must set `allow_nested_delegation` to `false`.

## 8. Validation Runner

The validator is a logical agent around deterministic commands, not an autonomous repair agent.

Rules:

- Select commands from `AGENTS.md` or receive them explicitly in the task capsule.
- Use `npm.cmd` in this Windows workspace.
- Keep the default validator adapter read-only. Commands that intentionally generate tracked assets belong to the scoped implementer task or a separately approved write-capable validation task.
- Capture the command, exit code, duration when available, and concise result.
- Check the worktree before and after commands that may generate output.
- Do not fix failures, change command scope, or declare the implementation correct.
- Escalate credentials, network, destructive behavior, and unexpected writes to the orchestrator.

## 9. Model Profiles And Vendor Mapping

Canonical roles use capability profiles rather than vendor model names:

| Profile | Intent | Codex mapping | Cursor mapping |
| --- | --- | --- | --- |
| `economy` | Extraction, scanning, commands, structured summaries | GPT-5.6 Terra with low reasoning | Composer 2.5 Fast |
| `balanced` | Scoped implementation and governance maintenance | GPT-5.6 Terra with medium or high reasoning | Cursor Grok 4.5 High Fast |
| `frontier` | Orchestration, architecture, and independent high-risk review | GPT-5.6 Sol with high reasoning | Inherit the user-selected primary model |

Choose the primary agent's model in the active client. Use Sol with high reasoning for ordinary orchestration, Max for the hardest single-agent reasoning, and Ultra only when the task has meaningful independent subproblems. Do not encode primary-user preferences in portable role contracts.

Cursor maps `scout` and `validator` to the economy model, `implementer` and `docs-steward` to the balanced model, and `verifier` to the selected primary model. Cursor `readonly: true` is applied to scout, validator, and verifier. The orchestrator remains the parent session rather than a delegated adapter.

Other vendor adapters must preserve role intent, access boundary, and result contract even when their model names or reasoning controls differ.

## 10. Vendor Adapter Contract

A vendor adapter must:

1. identify the canonical role file it loads;
2. map capability and reasoning profiles to supported native settings;
3. apply the narrowest available sandbox and tool surface;
4. inherit `AGENTS.md` and approved project skills;
5. return the shared result contract;
6. invoke the shared result validator at the closest available subagent-completion lifecycle boundary;
7. remain thin and avoid duplicating project rules;
8. fail closed or fall back to sequential primary-agent execution when a required control is unavailable.

The implementation includes Codex adapters under `.codex/agents/` and Cursor adapters under `.cursor/agents/`. Claude, Gemini, and other adapters require their own verified native configuration, but reuse the canonical roles and contracts.

## 11. Failure And Fallback

- If a delegated task is blocked, return the exact missing authority, evidence, or external state.
- If a result fails runtime validation, request one format-only correction. If the correction also fails, mark that delegated task blocked instead of repairing or accepting the payload in the primary thread.
- If an agent exceeds scope or writes unexpectedly, stop that role and inspect the worktree before continuing.
- If agents disagree, the orchestrator checks source evidence; it does not average conclusions.
- If native subagents are unavailable, run the same lifecycle sequentially and report that independent execution was unavailable.
- If a vendor adapter becomes stale, disable that adapter without changing the canonical role contract.

## 12. Acceptance Criteria

The orchestration system is operating correctly when:

- trivial tasks stay single-agent;
- broad tasks receive explicit task capsules;
- the primary context receives concise evidence instead of raw logs;
- no shared-worktree task has concurrent writers;
- implementation and verification remain independently attributable;
- every completion claim has fresh evidence and required owner approval;
- every lifecycle-capable adapter rejects malformed result envelopes before consolidation;
- switching vendor adapters preserves role boundaries and result fields;
- missing capabilities produce an explicit fallback instead of a false success claim.

## 13. External Standards

Checked on 2026-07-28:

- AGENTS.md open format: <https://agents.md/>
- Agent Skills specification: <https://agentskills.io/specification>
- Model Context Protocol: <https://modelcontextprotocol.io/specification/latest>
- Agent2Agent Protocol: <https://a2a-protocol.org/latest/>
- Codex subagents: <https://learn.chatgpt.com/docs/agent-configuration/subagents>
- Codex hooks: <https://learn.chatgpt.com/docs/hooks>
- Cursor subagents: <https://cursor.com/docs/subagents>
- Cursor hooks: <https://cursor.com/docs/hooks>

A2A is not part of the initial implementation. It is appropriate only if independently hosted agents need a common network communication protocol.
