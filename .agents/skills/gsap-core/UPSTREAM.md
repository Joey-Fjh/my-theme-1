# Upstream provenance

| Field | Value |
| --- | --- |
| Upstream repository | https://github.com/greensock/gsap-skills |
| Pinned revision | `aed9cfd3277740755f6bfc1155c7aa645403b760` |
| Upstream path | `skills/gsap-core/SKILL.md` |
| Retrieved | 2026-09-20 |
| License | MIT — Copyright (c) 2026 GreenSock (see `LICENSE` in this directory) |

## Project boundary

This skill is agent documentation reference only. It does not authorize vendoring or loading the GSAP runtime, and it does not add storefront payload. Project motion policy in `docs/references/architecture/motion-architecture.md` takes precedence: the mother template ships no section reveal, and derived themes define ordinary reveal under that policy; use this skill only after that reference classifies work as explicit complex choreography.

## When to use (project routing)

Read this skill when implementing or reviewing GSAP core APIs (tweens, easing, timelines at the animation level) for work already classified as explicit complex choreography. Do not reach for it for ordinary section reveal, dialog/drawer motion, or default scroll-in effects.
