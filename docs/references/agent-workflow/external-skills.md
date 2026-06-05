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

| Source | Adoption level | Intended value | Project adaptation boundary | Routing |
| --- | --- | --- | --- | --- |
| `greensock/gsap-skills` | **Adapted workflow** | GSAP API, timelines, ScrollTrigger, performance guidance | Core patterns adapted into `docs/references/architecture/motion-architecture.md`. Consult original for advanced GSAP API questions not covered there. | Motion, animation, GSAP tasks → `motion-architecture.md` first; consult original only for API gaps |
| `garrytan/gstack` | Reference only | Iterative requirement gathering (Confusion Protocol), design consultation, systematic debugging | Consult for requirement clarification through forcing questions before implementation. Also useful for design system thinking and root-cause debugging. Do not import slash-command surface or multi-role structure. | Ambiguous or broad user requests → requirement gathering patterns (Confusion Protocol); Design review → design consultation; Debugging → investigation methodology |
| `obra/superpowers` | Reference only | TDD for architecture judgment, planning discipline, bite-sized task breakdown | Consult for RED-GREEN-REFACTOR verification mindset when making architecture decisions. Also useful for complex multi-section planning. Do not import rigid workflow chain wholesale. | Architecture decisions → TDD verification patterns; Complex implementation → planning methodology |
| `anthropics/skills` (`frontend-design`) | Reference only | Distinctive frontend design, anti-AI-slop aesthetics, typography, color systems, motion, spatial composition | Consult for design direction and aesthetic quality when building UI components or pages. Project already has GSAP motion architecture and Tailwind utility system; adapt design guidance to project's existing token and typography tiers. Do not import wholesale. | UI/CSS design → design direction and aesthetics; Anti-AI-slop → distinctive visual choices |

## Workflow Skill Strategy

External workflow skills such as `obra/superpowers`, `garrytan/gstack`, and `anthropics/skills` (`frontend-design`) remain **Reference only** by default but are **routable** — the routing table in `skill-routing.md` identifies which task classes should consult them.

When the routing table or `agent-router` directs consultation, the agent SHOULD read the relevant external skill for that task. This is not "install and auto-trigger"; it is "read and apply selectively."

Agents SHOULD NOT install external skills into `.agents/skills/` or `.claude/skills/`. Reading from the original source (GitHub, web) is temporary research and does not require installation.

When an external skill is consulted for a routed task, agents must report:

- what task triggered the consultation
- what idea or pattern was useful
- what was rejected (and why)
- whether the idea should be adapted into project-owned docs permanently

Do not import external workflow systems wholesale. Extract only the patterns relevant to the current task.

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
