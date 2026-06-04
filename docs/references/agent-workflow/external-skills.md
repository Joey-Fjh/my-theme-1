# External Skills Governance

This reference defines how third-party or official skills may influence this project. `AGENTS.md` remains the rule source.

## Principle

Third-party skills are valuable because they encode mature workflows and domain expertise. They are also external inputs. Use them through an explicit governance path before allowing them to affect project behavior.

External skills never override:

- `AGENTS.md`
- project architecture references
- merchant-owned configuration boundaries
- Shopify Theme Store readiness
- project validation commands

## Adoption Levels

| Level | Meaning | Allowed use |
| --- | --- | --- |
| Reference only | Read for ideas or technical guidance | May inform a plan or implementation report |
| Adapted workflow | Rewrite the useful method into project docs or a project skill | May be routed by `agent-router` |
| Tool adapter installed | Installed in a tool-specific directory such as `.claude/` or user home | Must be documented with scope and limitations |
| Project approved | Adapted into `.agents/skills/` or project docs | May be treated as project workflow, still below `AGENTS.md` |

Default level is **Reference only**.

For this project, the practical default is to keep external skills at **Reference only** unless there is a specific, reviewed adoption decision. The project already has its own agent framework, routing, Shopify theme architecture, validation commands, and launch-readiness boundaries. Installing an external skill can make it auto-trigger, add competing workflow guidance to context, and create version drift that is harder to audit than a project-owned reference.

Remote reading and local installation are different risk levels. Reading an external skill is temporary research. Installing it into a user-level or project-level skill directory can affect future conversations without being visible in the current prompt.

Project-level installation is especially risky in this repository because `.claude/skills` is a symlink adapter to `../.agents/skills`. A Claude local skill install can therefore write into the project skill source and bypass the adaptation process. Do not install third-party skills into `.claude/skills` or `.agents/skills` unless they have been rewritten as project-owned skills and approved through this document.

## Candidate Registry

| Source | Default level | Intended value | Project adaptation boundary |
| --- | --- | --- | --- |
| `greensock/gsap-skills` | Reference only | GSAP API, timelines, ScrollTrigger, performance guidance | Must map to `Components.register()`, `window.__Theme__.Motion`, scoped selectors, cleanup, no-JS visibility, and launch readiness |
| `obra/superpowers` | Reference only | Workflow chain, relevant-skill checking, planning discipline | May inspire router/workflow docs; do not import its mandatory TDD or subagent process wholesale |
| `garrytan/gstack` | Reference only | Slash-command workflows, specialist roles, review/QA/release flow | May inspire future tool adapters; do not require gstack or list its commands in `AGENTS.md` |
| `mattpocock/skills` | Reference only | Small composable skills, setup skill, shared language/docs | May inspire project setup/routing skills; adapt to Shopify theme boundaries first |

## Use Procedure

Before using an external skill for project work:

1. Identify the source and adoption level.
2. Check whether the task explicitly benefits from that external expertise.
3. Map external recommendations to project architecture and launch constraints.
4. Reject recommendations that require unapproved runtime, script-order, vendor, MCP, hook, or configuration changes.
5. Report what was adopted, rejected, and why.

Before installing or approving an external skill:

1. Read the skill source and any scripts it can execute.
2. Record source, version or commit, intended use, and limitations.
3. Decide whether it is a tool adapter install or a project-approved adaptation.
4. Keep tool-specific installs outside `.agents/skills/` unless the skill is adapted as a project skill.
5. Prefer adapting useful ideas into project docs or `.agents/skills/` instead of importing the external skill wholesale.
6. Add routing only after the boundary is documented.

## GSAP-Specific Boundary

External GSAP guidance must be adapted to this theme:

- Lifecycle through `Components.register()`.
- Shared choreography through `window.__Theme__.Motion` when reusable.
- Scoped selectors from the component root.
- Cleanup through `destroy()` and `ctx.revert()`.
- Critical content visible without JavaScript or motion completion.
- Reduced motion respected.
- No Theme Store, Lighthouse, mobile, or accessibility regressions.

If external GSAP advice requires a new plugin, vendor file, dynamic import, script load change, or global runtime change, treat it as Rule Alignment or Architecture Audit before implementation.
