---
name: frontend-design
description: Create distinctive frontend design that avoids generic AI aesthetics. Use when building UI components, sections, pages, or when the user asks for design direction, visual quality, or aesthetic improvement.
---

<!-- Source: github.com/anthropics/skills
     Reviewed commit: da20c92, 2026-05-29
     Extracted: design direction, typography, color/theme, composition, anti-generic checks
     Excluded: React/Motion library references, canvas-design, brand-guidelines
     Project boundary: AGENTS.md overrides this skill. Adapt to the project's Tailwind + typography tiers. -->

# Frontend Design

Use this skill for visual quality, interaction design, responsive layout, and design-system fit in the Shopify theme.

## Workflow

1. Define the design purpose, audience, tone, and storefront context.
2. Check existing section/snippet patterns before inventing a new visual system.
3. Preserve merchant configurability: color schemes, typography tiers, schema settings, and content ownership.
4. Design mobile-first and verify at 375px, 768px, and 1280px when UI changes are visual.
5. Keep critical first-viewport content visible without JavaScript or animation completion.

## Project Constraints

- Use project typography tiers; do not add ad-hoc heading text sizes.
- Use theme color-scheme tokens; do not hardcode brand colors unless explicitly scoped.
- CSS/Alpine first for simple motion and micro-interactions.
- GSAP only after motion classification confirms complex narrative choreography.
- Respect `prefers-reduced-motion`.
- Tailwind utilities first; no ad-hoc `<style>` blocks in Liquid.

## Design Checks

- Avoid generic centered heroes, decorative gradients, and repeated card layouts without product or brand signal.
- Compare layout ratio, spacing, crop, type scale, contrast, motion rhythm, hover/tap feedback, and mobile reflow.
- Prefer screenshots when Figma MCP access is incomplete or rate-limited.
