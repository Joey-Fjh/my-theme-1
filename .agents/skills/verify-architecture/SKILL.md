---
name: verify-architecture
description: Verify architecture decisions and implementation claims with evidence. Use before claiming work is complete, when making architecture decisions that need validation, or when the user asks to verify or review a change.
---

<!-- Source: github.com/obra/superpowers
     Reviewed commit: 6fd4507, 2026-05-29
     Extracted: verification-before-completion gate
     Excluded: full TDD cycle, subagent flow, executing-plans, finishing-branch
     Project boundary: AGENTS.md overrides this skill -->

# Verify Architecture

Use this skill when a claim needs evidence, especially after architecture, CSS/JS runtime, launch, or cross-session work.

## Workflow

1. Name the claim being verified.
2. Identify the command, file evidence, screenshot, or runtime observation that would prove it.
3. Run or inspect the evidence fresh.
4. Read the output fully, including warnings.
5. Report the actual status with evidence; do not infer from partial checks.

## Evidence Guide

| Claim | Evidence |
| --- | --- |
| Theme Check passes | `npm.cmd test` output with 0 offenses |
| Lint clean | `npm.cmd run lint` output with no failures |
| Tailwind output current | `npm.cmd run build:tw` after Tailwind source changes |
| Architecture contract holds | matching source evidence plus `npm.cmd run lint:theme` when relevant |
| Layout or motion works | browser screenshot or runtime observation at relevant viewports |
| Mobile works | mobile viewport or device testing, not desktop-only inspection |
| Accessibility OK | keyboard/focus behavior and semantic evidence |

## Guardrails

- Treat "should", "probably", and "seems to" as unverified.
- Do not claim completion from old command output.
- Use the smallest proving command, but include `npm.cmd run lint` and `npm.cmd test` after meaningful theme changes.
- Run `npm.cmd run build:tw` only when Tailwind source changed.
- Run `npm.cmd run build:svg` only when `icons/` changed.
