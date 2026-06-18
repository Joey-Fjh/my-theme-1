---
name: implement-theme-pattern
description: Implement or modify Shopify theme code following canonical patterns. Use when building or cleaning theme code.
when_to_use: >
  Liquid sections, section lifecycle JS, Alpine components, ThemeEvents, ShopifyHttp,
  SectionRefresher, cart flows, Swiper, GSAP choreography, motion transitions,
  CSS layering, accessibility patterns. Also for architecture cleanup of existing theme code.
---

# Implement Theme Pattern

Use this skill when code work needs a canonical implementation shape. `AGENTS.md` remains authoritative; docs references provide copyable patterns only.

## Workflow

1. Read `AGENTS.md` for the relevant rule family.
2. Follow `AGENTS.md` behavior rules for question policy, task frame, and cross-session context.
3. Classify the requested behavior before choosing a pattern.
4. Load only the docs reference that matches the behavior being implemented.
5. Keep edits scoped to the touched feature and preserve merchant-owned configuration.

## Pattern References

- Section lifecycle: `docs/references/patterns/canonical-section.md`
- Alpine component: `docs/references/patterns/canonical-alpine-component.md`
- ThemeEvents: `docs/references/patterns/canonical-events.md`
- HTTP or section refresh: `docs/references/patterns/canonical-http-section-refresh.md`
- Cart flow: `docs/references/patterns/canonical-cart-flow.md`
- Swiper section: `docs/references/patterns/canonical-swiper-section.md`
- GSAP choreography (optional, narrative-only): `docs/references/patterns/canonical-gsap-section.md`
- Alpine/CSS state motion: `docs/references/patterns/canonical-motion-transition.md`
- CSS layering: `docs/references/patterns/canonical-css-layering.md`
- Accessibility semantics: `docs/references/patterns/canonical-accessibility.md`

## Guardrails

- Do not load every reference by default.
- Do not copy a pattern that conflicts with `AGENTS.md`.
- Do not add JavaScript where static markup is enough.
- Do not move validation scripts into this skill; task-specific validation scripts live under `.agents/skills/*/scripts/`.
- Run only the smallest relevant validation after implementation.
- Ordinary reveal/state motion should route to `canonical-motion-transition` or a future CSS/Alpine reveal pattern. Route to GSAP only after `motion-architecture` classification confirms complex narrative choreography.
