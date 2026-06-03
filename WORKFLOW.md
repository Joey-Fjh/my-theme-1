# Agent Workflow

`AGENTS.md` defines repository rules. This file defines the shared agent work context: how different agents, tools, and environments should analyze user intent, gather context, act, verify, and hand off work in this repository.

If this file conflicts with `AGENTS.md`, follow `AGENTS.md`.

---

## Core Loop

Use this ReAct-style loop for every non-trivial task:

```text
Reason -> Act -> Observe -> Adjust
```

- **Reason**: Interpret the user's purpose, identify the phase, classify ownership and risk, and decide which repository rules apply.
- **Act**: Read files, ask focused questions, produce a prompt, or edit code only when the phase and user intent allow it.
- **Observe**: Inspect command output, diffs, tests, Lighthouse data, browser behavior, or user feedback.
- **Adjust**: Update the plan, continue the next smallest action, or report a blocker with the exact missing decision.

The external report can still use this practical shape:

```text
Observe -> Classify -> Plan -> Act/Prompt -> Verify -> Report
```

- **Observe**: Read the task, `AGENTS.md`, this workflow, relevant files, current diff, and only the matching skill references or external skills that match the task.
- **Classify**: Identify ownership, risk, phase, and whether the issue is code, configuration, content, asset, Shopify platform/vendor, or measurement noise.
- **Plan**: State the current phase, allowed actions, forbidden actions, and expected output when the work is ambiguous or multi-step.
- **Act/Prompt**: Implement only when the phase allows it. If acting as reviewer or prompt-writer, provide the next precise prompt instead of editing.
- **Verify**: Run the agreed checks or request the required Lighthouse/manual retest.
- **Report**: Summarize changed files, evidence, risk, and the next phase. Persist decisions in prompts or docs, not only chat.

### Agent Response Protocol

For ambiguous, multi-step, cleanup, Lighthouse, architecture, rule-setting, cross-session, or handoff work, the agent MUST first map the user request into the repository work context before changing files.

Use this compact mapping:

```text
Purpose: the outcome the user wants
Context: files, commits, reports, screenshots, or prior decisions that must be considered
Decomposition: the action split, including what to read, what to classify, what may be edited, and what is forbidden
Feedback: the expected return format, verification hooks, handoff notes, or record of current execution
```

The agent does not need to print this mapping for trivial tasks. It SHOULD print or summarize it when the user's request is broad, cross-session, or could trigger risky edits.

If the user's action scope is unclear, the agent MUST ask before editing. If the user asks for orientation, summarize state and do not modify code. If the user asks for a prompt, produce the prompt and do not implement it. If the user asks for review, use review stance and do not refactor.

---

## Question Policy

Facts discoverable from the repository must be inspected before asking the user.

Ask the user when the unknown is a product preference, visual direction, configuration ownership question, architecture boundary, launch-risk tradeoff, or other high-impact decision that the repository cannot answer.

Do not silently guess on high-risk ambiguity. When a question is answered, carry that decision into the next prompt, plan, or document update.

---

## User Task Frame

User questions and prompts should be easy for agents to route into the ReAct loop. For complex, ambiguous, cross-session, architecture, audit, or rule-setting work, interpret the user's request through this frame:

```text
Purpose -> Context -> Decomposition -> Feedback
```

The user does not need to fill every field perfectly. The agent is responsible for mapping the request into the frame and asking only for missing high-risk pieces.

### Purpose

What outcome is the user trying to reach?

Examples:

- Close the Lighthouse phase without further speculative fixes.
- Understand the current CSS/token system before changing it.
- Produce a prompt for another agent, not code changes.
- Convert a discussion into stable project rules.

### Reasoning Frame

How should the agent think about the work? This is optional user context, and the agent should fold it into `Context` and `Decomposition`.

Examples:

- Stability first.
- Classify code/config/content/asset/platform/noise before fixing.
- Progressive governance: map first, then rule, then small cleanup.
- Do not chase perfection; preserve launch readiness.
- Use Shopify Theme Store standards as the baseline.

### Context

What should the agent read or preserve while reasoning?

Examples:

- Reference `AGENTS.md`, `WORKFLOW.md`, recent commits, and the current diff.
- Use the attached Lighthouse JSON as the evidence source.
- Treat a linked file, screenshot, or prior prompt as the working context.
- Preserve previous user decisions about merchant-owned configuration.

### Decomposition

How should the work be split into actions?

Examples:

- Read and audit only.
- Classify first, then propose a fix.
- Implement one rule family only.
- Produce a prompt for another agent, not code changes.
- Ask questions before modifying code.
- Do not modify merchant configuration, generated files, vendor files, or business templates.

### Feedback

What should the agent return, and how should the next turn continue?

Examples:

- Findings ordered by risk.
- Keep/revert recommendation.
- Next-stage prompt.
- Questions that need user confirmation.
- Verification results and remaining follow-ups.
- Test after-action hooks, such as `npm run lint`, Theme Check, Lighthouse retest, or manual browser verification.
- A record of what was executed, what was intentionally not touched, and what should be carried into the next agent session.

### User Prompt Template

Users MAY structure requests like this when they want predictable agent behavior:

```text
Purpose:
Context:
Decomposition:
Feedback:
Constraints:
```

- **Purpose**: Desired outcome, such as audit, cleanup, prompt generation, launch gate, or rule alignment.
- **Context**: Referenced files, commits, screenshots, reports, prior decisions, or external skills.
- **Decomposition**: How to split the work, such as read-only first, classify before fixing, one batch only, or prompt-only.
- **Feedback**: Expected output and verification hooks, such as tests to run, handoff notes to record, or retest instructions.
- **Constraints**: Files or ownership areas that must not be changed.

### Agent Responsibility

When the user gives an incomplete request, the agent SHOULD briefly restate the inferred frame before acting:

```text
Purpose: ...
Context: ...
Decomposition: ...
Feedback: ...
```

If Purpose or Decomposition is unclear and the decision could cause code churn, configuration changes, new files, or architecture drift, ask before proceeding.

Do not force this frame on trivial one-step tasks.

---

## External Skills

Use external or official skills only when the task explicitly involves that technology.

Local canonical implementation examples live under `docs/references/patterns/`. They are skill references, not rule sources. Load only the reference that matches the behavior being implemented.

For GSAP work, the primary external reference is [`greensock/gsap-skills`](https://github.com/greensock/gsap-skills) -- the GreenSock official AI skills repository covering GSAP API, timelines, ScrollTrigger, plugins, and performance. It is a technical reference only; it does not define project rules.

Map any external recommendation back to:

- `Components.register()`
- `window.__Theme__.Motion`
- scoped selectors
- no-JS visibility for critical content
- cleanup in `destroy()`
- reduced motion expectations
- Lighthouse / Theme Store readiness
- Motion duplication prevention (check for existing recipes before adding new motion code)
- Motion encapsulation / architecture stability rules (ownership, lifecycle, policy entry points)

If an external recommendation requires script-order changes, conditional vendor loading, global runtime changes, or section lazy-loading strategy, move the task to Rule Alignment or Architecture Audit before implementation.

Reports must state which external recommendations were adopted, which were rejected, and why.

---

## Phase 0: Context Intake

**Input**: User request, current diff, `AGENTS.md`, this file, and task-specific skill references.

**Allowed**:

- Read relevant files.
- Inspect current git diff and scripts.
- Read matching canonical examples from `docs/references/patterns/`.
- Read external skills only when the task clearly names or requires that technology.

**Forbidden**:

- Broad unrelated repo rewrites.
- Creating new docs or tools before the phase requires them.
- Treating skill references or external skills as rule sources.

**Output**:

- The current phase.
- Relevant facts found.
- Open decisions that require user input.

---

## Phase 1: Lighthouse Pass

**Input**: Lighthouse JSON exports and target page context.

**Allowed**:

- Compare multiple runs.
- Classify findings as code, configuration, content, asset, platform/vendor, or noise.
- Fix only code-owned issues when implementation is requested.
- Provide exact prompts for another agent.

**Forbidden**:

- Code-fixing color schemes, merchant content, uploaded media, template JSON, settings data, app scripts, Shopify platform scripts, or vendor payloads without explicit approval.
- Adding Lighthouse tooling or threshold files.
- Chasing run-to-run noise with speculative code changes.

**Output**:

- Audit mapping.
- Files changed or proposed.
- Expected metric impact.
- Retest instruction.
- Remaining non-code issues.

---

## Phase 2: Rule Alignment

**Input**: Unclear rules, repeated agent disagreement, or architecture concerns.

**Allowed**:

- Use focused question-and-answer to define preferences.
- Update `AGENTS.md` or this file when implementation is requested.
- Decide boundaries for motion, CSS, typography, tokens, tooling, and external skills.
- Decide whether new files belong in Git, Shopify upload scope, and Prettier formatting scope before adding or deleting governance/tooling files.

**Forbidden**:

- Refactoring business code while rules are still unsettled.
- Adding separate rule documents unless explicitly approved.
- Adding ignore rules without naming which tool the rule is for: Git, Shopify CLI, or Prettier.

**Output**:

- Stable rule text.
- A decision-complete implementation prompt or plan.
- Any required `.gitignore`, `.shopifyignore`, or `.prettierignore` changes.

---

## Phase 3: Technical Debt Audit

**Input**: Stable rules and target scope.

**Allowed**:

- Audit without code changes.
- Group findings by rule family.
- Identify blockers, warnings, legacy debt, and false positives.

**Forbidden**:

- Fixing issues during the audit.
- Mixing unrelated rule families.
- Reporting merchant configuration or content choices as code violations.

**Progressive Disclosure**:

Technical debt audits MUST use progressive disclosure -- report the most critical items first, defer the rest:

1. **Blockers first**: Report MUST-level launch blockers (accessibility, SEO, Theme Check, runtime stability) before anything else.
2. **Warnings second**: Report SHOULD-level findings, review warnings, and known follow-ups as a separate group. Label them as warnings or post-launch debt, not as blockers.
3. **Small rule-family batches**: Each audit pass SHOULD recommend fixes for one rule family at a time. Do not dump an unclassified list of every possible improvement.
4. **Every finding needs a disposition**: Each recommendation MUST state one of:
    - **now** -- launch blocker, fix in this pass
    - **later** -- post-launch debt, staged with an owner or follow-up note
    - **ignore** -- false positive, platform issue, or not code-owned
    - **needs user decision** -- preference, design tradeoff, or configuration ownership question

**Output**:

- Blockers (now).
- Warnings and post-launch debt (later), grouped by rule family.
- Ignored or deferred items with rationale.
- Questions requiring user decision.

---

## Phase 4: Small-Batch Cleanup

**Input**: Approved findings from Phase 3.

Typography cleanup is audit-first. Unless the user gives an explicit execution list, agents only report typography findings and do not edit Liquid or CSS.

**Allowed**:

- Fix one rule family per batch.
- Preserve schema IDs, block types, section types, template references, and merchant-facing behavior.
- Run the smallest relevant checks after each batch.
- For typography cleanup, implement only the approved items. Do not infer visual intent from class names, nearby markup, approximate font sizes, or lint results.

**Forbidden**:

- Redesigning sections for subjective consistency.
- Combining visual redesign, architecture cleanup, Lighthouse fixes, and configuration changes.
- Creating new abstractions or tools unless already approved by `AGENTS.md` rules.
- Auto-converting typography classes or heading tags without user approval.
- Treating `hxxxl`-`h0` display tiers on heading elements as standard heading mismatches.

**Output**:

- Files changed.
- Rule family enforced.
- Behavior intentionally preserved.
- Verification results.
- Remaining follow-up.
- For typography cleanup, list the approved items implemented and any findings left for manual review.

---

## Phase 5: Launch Gate

**Input**: Candidate release state.

**Allowed**:

- Run and summarize lint, Theme Check, tests, Lighthouse results, and known issue classification.
- Record pre-existing warnings and accepted non-code issues.

**Forbidden**:

- Creating separate launch checklist files.
- Hiding known blockers as warnings.
- Changing merchant configuration or content to pass a gate.

**Output**:

- Launch blockers: none or list.
- Warnings and accepted risks.
- Checks run and results.
- Required retests or owner decisions.

---

## Cross-Session Handoff

Every handoff should include:

- Current phase.
- Objective.
- Files changed or intentionally untouched.
- User decisions made.
- Checks already run.
- Known blockers.
- Next recommended prompt.

Do not rely on chat memory alone for rules that should govern future work.
When a handoff needs to persist beyond the chat, record it in `docs/agent/next-session.md`.
