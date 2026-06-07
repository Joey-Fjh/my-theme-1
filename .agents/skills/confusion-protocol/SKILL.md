---
name: confusion-protocol
description: Stop and clarify when facing high-stakes ambiguity before implementation. Use for architecture decisions, data model choices, destructive scope changes, or missing context that could cause real damage if assumed wrong.
---

<!-- Source: github.com/garrytan/gstack
     Reviewed commit: cab774c, 2026-06-04
     Extracted: Confusion Protocol, AskUserQuestion framework
     Excluded: multi-pass review, Review Army, specialist dispatch, confidence calibration
     Project boundary: AGENTS.md overrides this skill -->

# Confusion Protocol

## When to Use

For situations involving **high-stakes ambiguity** — architecture, data model, destructive scope, missing context. **Stop entirely** when proceeding without clarity could cause real damage.

**Not for:** routine coding, obvious changes, or tasks where the project docs already provide clear direction.

## The Protocol

1. **Name the ambiguity** in one sentence
2. **Present 2–3 options** with tradeoffs
3. **Ask the user** to decide

Do not proceed until the user has chosen.

## Decision Brief Format

Present structured decision briefs to the user. Use the agent's available user-input mechanism (e.g. `AskUserQuestion` in Claude Code); otherwise present the brief directly in your response. Each question follows this format:

**Header** — one-line question title.

**Context** — identify the project, branch, and task context.

**Plain explanation** — 2–4 sentences a non-technical person could follow, naming what's at stake.

**Stakes** — one sentence on what breaks if the wrong choice is made.

**Recommendation** — always present, with a concrete one-line reason. Mark with `(recommended)`.

**Options** — each option gets at least 2 pros and 1 con, each at least 40 characters.

**Net line** — one-line synthesis of the actual tradeoff.

## Rules

- **Neutral posture:** when there's no strong preference, say so but still keep the `(recommended)` label on the default.
- **Non-ASCII characters:** write literal UTF-8 directly — never `\u`-escape.
- **Self-check:** before emitting, verify the header, plain explanation, recommendation, and pros/cons minimums.

## Project Context

This skill operates within a Shopify theme project. When presenting options:

- Reference existing project architecture (`Components.register()`, `ThemeEvents`, `ShopifySectionRefresher`)
- Note impact on Theme Store readiness, Lighthouse, mobile, and accessibility
- Flag if an option requires changes to merchant-owned configuration
- Prefer options that align with existing project patterns over novel approaches
