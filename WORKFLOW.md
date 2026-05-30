# Agent Workflow

`AGENTS.md` defines repository rules. This file defines how agents move through work across sessions.

If this file conflicts with `AGENTS.md`, follow `AGENTS.md`.

---

## Core Loop

Use this loop for every non-trivial task:

```text
Observe -> Classify -> Plan -> Act/Prompt -> Verify -> Report
```

- **Observe**: Read the task, `AGENTS.md`, this workflow, relevant files, current diff, and only the examples or external skills that match the task.
- **Classify**: Identify ownership, risk, phase, and whether the issue is code, configuration, content, asset, Shopify platform/vendor, or measurement noise.
- **Plan**: State the current phase, allowed actions, forbidden actions, and expected output.
- **Act/Prompt**: Implement only when the phase allows it. If acting as reviewer, provide the next precise prompt instead of editing.
- **Verify**: Run the agreed checks or request the required Lighthouse/manual retest.
- **Report**: Summarize changed files, evidence, risk, and the next phase. Persist decisions in prompts or docs, not only chat.

---

## Question Policy

Facts discoverable from the repository must be inspected before asking the user.

Ask the user when the unknown is a product preference, visual direction, configuration ownership question, architecture boundary, launch-risk tradeoff, or other high-impact decision that the repository cannot answer.

Do not silently guess on high-risk ambiguity. When a question is answered, carry that decision into the next prompt, plan, or document update.

---

## User Collaboration Frame

For complex, ambiguous, cross-session, architecture, audit, or rule-setting work, interpret the user's request through this frame:

```text
Purpose -> Frame -> Action -> Feedback
```

The user does not need to fill every field perfectly. The agent is responsible for mapping the request into the frame and asking only for missing high-risk pieces.

### Purpose

What outcome is the user trying to reach?

Examples:

- Close the Lighthouse phase without further speculative fixes.
- Understand the current CSS/token system before changing it.
- Produce a prompt for another agent, not code changes.
- Convert a discussion into stable project rules.

### Frame

How should the agent think about the work?

Examples:

- Stability first.
- Classify code/config/content/asset/platform/noise before fixing.
- Progressive governance: map first, then rule, then small cleanup.
- Do not chase perfection; preserve launch readiness.
- Use Shopify Theme Store standards as the baseline.

### Action

What is the agent allowed to do now?

Examples:

- Read and audit only.
- Provide a Claude prompt.
- Implement a scoped documentation change.
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

### Agent Responsibility

When the user gives an incomplete request, the agent SHOULD briefly restate the inferred frame before acting:

```text
Purpose: ...
Frame: ...
Action: ...
Feedback: ...
```

If Purpose or Action is unclear and the decision could cause code churn, configuration changes, new files, or architecture drift, ask before proceeding.

Do not force this frame on trivial one-step tasks.

---

## External Skills

Use external or official skills only when the task explicitly involves that technology.

For GSAP work, an official or external GSAP skill may be used as a technical reference for API behavior, choreography patterns, and recommended usage. It does not override this repository's rules.

Map any external recommendation back to:

- `Components.register()`
- `window.__Theme__.Motion`
- scoped selectors
- no-JS visibility for critical content
- cleanup in `destroy()`
- reduced motion expectations
- Lighthouse issue classification

If an external recommendation requires script-order changes, conditional vendor loading, global runtime changes, or section lazy-loading strategy, move the task to Rule Alignment or Architecture Audit before implementation.

Reports must state which external recommendations were adopted, which were rejected, and why.

---

## Phase 0: Context Intake

**Input**: User request, current diff, `AGENTS.md`, this file, and task-specific examples.

**Allowed**:

- Read relevant files.
- Inspect current git diff and scripts.
- Read matching canonical examples.
- Read external skills only when the task clearly names or requires that technology.

**Forbidden**:

- Broad unrelated repo rewrites.
- Creating new docs or tools before the phase requires them.
- Treating examples or external skills as rule sources.

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

**Output**:

- Findings ordered by severity.
- File and line references.
- Recommended phase for each fix: now, later, ignore, or needs user decision.

---

## Phase 4: Small-Batch Cleanup

**Input**: Approved findings from Phase 3.

**Allowed**:

- Fix one rule family per batch.
- Preserve schema IDs, block types, section types, template references, and merchant-facing behavior.
- Run the smallest relevant checks after each batch.

**Forbidden**:

- Redesigning sections for subjective consistency.
- Combining visual redesign, architecture cleanup, Lighthouse fixes, and configuration changes.
- Creating new abstractions or tools unless already approved by `AGENTS.md` rules.

**Output**:

- Files changed.
- Rule family enforced.
- Behavior intentionally preserved.
- Verification results.
- Remaining follow-up.

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
