---
name: frontend-design
description: Create distinctive frontend design that avoids generic AI aesthetics. Use when building UI components, sections, pages, or when the user asks for design direction, visual quality, or aesthetic improvement.
---

<!-- Source: github.com/anthropics/skills
     Reviewed commit: da20c92, 2026-05-29
     Extracted: Design thinking, typography, color/theme, spatial composition, anti-AI-slop
     Excluded: React/Motion library references, canvas-design, brand-guidelines
     Project boundary: AGENTS.md overrides this skill. Adapt to project's existing Tailwind + typography tiers. -->

# Frontend Design

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (Shopify theme, Tailwind v4, Alpine.js, GSAP, performance, accessibility, mobile-first).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work — the key is intentionality, not intensity.

## Typography

Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics. Pair a distinctive display font with a refined body font.

**Project constraint**: Use the project's typography tiers (defined in Tailwind config) rather than ad-hoc text-size utilities. Headings use project typography classes, not Tailwind `text-*` utilities.

## Color & Theme

Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.

**Project constraint**: Color schemes are merchant-configurable. Design with the project's color scheme system (`color_scheme` in section schemas) rather than hardcoded values. Test across at least light and dark variants.

## Motion

Use animations for effects and micro-interactions. Prioritize CSS-only solutions for simple cases. Use GSAP for complex choreography through `Components.register()`.

Focus on high-impact moments: one well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions.

**Project constraints**:
- Critical content must be visible without JavaScript or animation completion
- Respect `prefers-reduced-motion`
- GSAP lifecycle through `Components.register()`, cleanup through `ctx.revert()`
- No opacity-0, hidden, or off-screen transforms on above-the-fold content

## Spatial Composition

Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.

**Project constraint**: Mobile-first. Layouts must work across the project's breakpoint system. Test at 375px, 768px, and 1280px minimum.

## Backgrounds & Visual Details

Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, and grain overlays.

**Project constraint**: Tailwind utility classes first; no ad-hoc `<style>` blocks in Liquid templates.

## Anti-AI-Slop Aesthetics

NEVER use generic AI-generated aesthetics:

**Font blacklist**: Inter, Roboto, Arial, system fonts, Space Grotesk (overused across AI generations).

**Color blacklist**: Purple gradients on white backgrounds, evenly-distributed pastels, generic "modern SaaS" palettes.

**Layout blacklist**: Predictable card grids, cookie-cutter hero sections, generic centered-content-with-icon patterns.

**The rule**: No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices across generations. Interpret creatively and make unexpected choices that feel genuinely designed for the context.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive details. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.
