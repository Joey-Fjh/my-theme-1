# Upstream provenance

| Field | Value |
| --- | --- |
| Upstream repository | https://github.com/emilkowalski/skills |
| Pinned revision | `2d228630ba1446365f614a108cb8252f1feda202` |
| Upstream path | `skills/review-animations/` (`SKILL.md`, `STANDARDS.md`); `LICENSE` from the repository root |
| Retrieved | 2026-10-13 |
| License | MIT License (see `LICENSE` in this directory) |

## Project boundary

This skill is a motion review aid only (user, 2026-10-13). It ranks below Shopify's official documentation (Shopify Dev MCP) and best practices, `AGENTS.md`, and the project references. Its `SKILL.md` sets `disable-model-invocation: true`, so agents read `SKILL.md` and `STANDARDS.md` by path when the `AGENTS.md` Agent Skills trigger applies, rather than invoking it as a skill.

Where its standards differ from the project, the project wins without further discussion:

- Motion ownership and tooling follow `docs/references/architecture/motion-architecture.md`. Open/close and show/hide stay Alpine state plus CSS classes, with no `x-transition`. GSAP is used only for classified choreography. One owner per element for `opacity` and `transform`.
- Reduced motion follows the motion reference. Where that reference removes a tween entirely, "gentler, not zero" does not override it.
- Hover gating uses the project's `can-hover` variant (`tailwind/tailwind.input.css`).
- Framer Motion, spring and React-specific advice does not apply to this theme's runtime.

Findings are reported in `docs/agent/context.md` with the skill's Block or Approve verdict. A finding outside the batch's implementation surface is reported, not applied.
