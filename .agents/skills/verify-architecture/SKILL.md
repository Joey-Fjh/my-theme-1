---
name: verify-architecture
description: Verify architecture decisions and implementation claims with evidence. Use before claiming work is complete, when making architecture decisions that need validation, or when the user asks to verify or review a change.
---

<!-- Source: github.com/obra/superpowers
     Reviewed commit: 6fd4507, 2026-05-29
     Extracted: RED-GREEN-REFACTOR verification mindset, verification-before-completion gate
     Excluded: full TDD cycle, subagent flow, executing-plans, finishing-branch
     Project boundary: AGENTS.md overrides this skill -->

# Verify Architecture

## Core Principle

**Evidence before claims, always.**

Claiming work is complete without verification is dishonesty, not efficiency.

## RED-GREEN-REFACTOR for Theme Work

This is a verification mindset, not a unit-testing mandate. Apply it to architecture decisions and implementation changes:

### RED — Define the failure state

Before making a change, define what "doesn't work" looks like:
- What behavior is broken or missing?
- How will you verify the change actually fixes it?
- What command or observation proves the current state is wrong?

### GREEN — Make the minimal change

Implement the smallest change that addresses the failure:
- One section, one component, one behavior at a time
- Don't add adjacent improvements while fixing
- Verify the change produces the expected result

### REFACTOR — Clean up after verification

Only after the change is verified:
- Remove duplication
- Improve naming
- Extract reusable patterns
- Keep verification passing throughout

### Repeat

Next failure state for next change.

## Verification Gate

Before claiming any status:

```
1. IDENTIFY: What command or observation proves this claim?
2. RUN: Execute the verification (fresh, complete)
3. READ: Full output — check for errors, warnings, regressions
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim
```

Skip any step = not verifying.

## Common Claims and Required Evidence

| Claim | Requires | Not sufficient |
| --- | --- | --- |
| Theme Check passes | `npm test` output: 0 errors | Previous run, "should pass" |
| Lint clean | `npm run lint` output: 0 errors | Partial check, extrapolation |
| Layout correct | Browser screenshot or DOM inspection | "Looks right in code" |
| Mobile works | Mobile viewport testing | Desktop testing only |
| Accessibility OK | Keyboard navigation + screen reader check | Visual inspection only |
| Animation works | Observed in browser with reduced-motion check | Code review only |
| Bug fixed | Original symptom gone + no regressions | Code changed, assumed fixed |

## Red Flags — STOP

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Perfect!", "Done!")
- About to commit without running verification
- Relying on partial verification
- Trusting previous run results without re-running

## Rationalization Prevention

| Excuse | Reality |
| --- | --- |
| "Should work now" | Run the verification |
| "I'm confident" | Confidence != evidence |
| "Just this once" | No exceptions |
| "Linter passed" | Linter != Theme Check |
| "Code looks correct" | Code review != runtime verification |
| "Partial check is enough" | Partial proves nothing |

## Project Validation Commands

Use the smallest command that proves the change:

```bash
npm run lint          # i18n, theme architecture, and format checks
npm run lint:theme    # Liquid, JS architecture, Alpine, HTTP/cart, heading rules
npm run lint:i18n     # locale keys, translated strings, schema copy, ARIA copy
npm test              # Shopify Theme Check
npm run build:tw      # rebuild Tailwind output after Tailwind source changes
npm run build:svg     # regenerate SVG assets after icons/ changes
```

Run `npm run lint` and `npm test` after meaningful theme changes. Run `npm run build:tw` only when Tailwind source changed. Run `npm run build:svg` only when `icons/` source changed.
