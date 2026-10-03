# Abstraction Boundary Reference

This reference stores shared-abstraction discipline details that are too long for `AGENTS.md`. `AGENTS.md` remains the rule source. Read this file before extending base classes, registered Alpine components used by multiple sections, public utilities such as `ShopifyHttp` / `SectionRefresher`, or pagination/refresh helpers.

## Boundary Principle

Shared abstractions carry a contract that every consumer silently depends on. Extending the contract for a new use case can break existing consumers in ways that surface far from the change.

Before adding a new shared abstraction, inspect existing snippets, components, and utilities. Reuse an existing abstraction only when semantics, invariants, lifecycle, and ownership match.

Before extending any shared abstraction, apply the three-question gate below. If any answer triggers, do not extend the abstraction.

Extension is allowed only when the new use case shares the same core invariants as the existing callers. If you believe the abstraction can be safely extended, explicitly state which invariants remain unchanged in the task summary or code review notes.

## Three-Question Gate

1. Invariants: does the new use case share the same invariants as existing callers, such as target DOM identity, rendering context, and lifecycle assumptions? Or only surface syntax, such as URL strings, fetch calls, or similar-looking inputs?
    - Repository example: `sectionPagination` assumes the same section in the same page context is being refreshed with different parameters. A collection tab that changes the collection pathname does not share that invariant, even if it still uses a URL and an HTTP request.
2. Naming: does the new method or parameter read naturally on the existing class? Awkward names like `sectionPagination.loadCollectionTab()` are early signals of mis-fit.
3. Branching parameter: are you adding an enum or boolean that switches core behavior, not just a side effect?
    - Side-effect toggles like `updateHistory`, `silent`, or `signal` are fine.
    - Core-behavior toggles like `refreshMode: 'full' | 'partial'` or `mode: 'replace' | 'append'` are red flags.

## Resolution When The Gate Triggers

Pick one, in this order of preference:

1. Simpler, non-shared solution, such as native page navigation instead of Section Rendering API refresh, or inline logic at the call site if it is truly one-off.
2. New dedicated component with a clear single responsibility, even if it duplicates a few lines from an existing component.
3. Refactor the existing abstraction first, only after the new boundary is well understood.

Never add a parameter to an existing public method just to make a divergent new case work.

## Anti-Patterns

| Bad                                                                                       | Correct                                                                                      |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Add `mode: 'a' \| 'b'` to a shared method to support a divergent new case                 | New method or new component with a single responsibility                                     |
| Add a `data-*` attribute on a shared component root that only one branch reads internally | Pass the value through the call site or scope it to the consumer                             |
| Reuse a base class because the URL pattern looks similar                                  | Compare invariants, not surface syntax                                                       |
| Copy a hot snippet of behavior into a shared base class to "make it reusable"             | Wait for a third real consumer before generalizing a JS abstraction (the CSS shared-layer threshold is in `css-architecture.md`) |
| Create a renamed near-copy of an existing abstraction instead of extending or splitting intentionally | New dedicated component or explicit extension when invariants match                          |

## Snippet API Semantics

Snippets are the theme's reusable UI components. Their parameter contracts follow these rules:

1. **Semantic variants over raw class params.** When a snippet needs visual variants, expose semantic parameters (e.g., `size: 'sm'`, `style: 'outline'`) that map to internal Tailwind classes. Do not expose raw `class` parameters as the primary way to customize appearance.

2. **Raw class params as escape hatches.** A `class` parameter MAY exist for documented edge cases where a consumer needs one-off customization that does not warrant a new semantic variant. Document this as an escape hatch, not the primary API.

3. **Do not split snippets only because they are long.** A snippet that is long but has a single coherent responsibility should stay as one file. Split only when the parts have genuinely different consumers, lifetimes, or contracts. Length alone is not a boundary signal.

4. **Parameter defaults must be safe.** Every snippet parameter with a default must render a correct, visible, accessible result when the consumer omits it. An omitted parameter must never produce broken HTML, invisible content, or missing ARIA.

## Layout primitives (5-C3a)

| Snippet | Parameters (semantic) | Notes |
| --- | --- | --- |
| `section-frame` | `section`, `children`, `background`, `width`, `height_kind`, `padding_mode`, `motion`, `safe_top`, `surface_section`, `scheme_target`, `root_style`, `root_attrs` | `scheme_target` places the colour scheme class on the root (default), the page-width inner wrapper, or nowhere (`none`: the section applies it itself, keeping `HEAD`'s placement); `motion: true` emits literal CAP-01 mount attributes only; padding via `--section-frame-padding-*` custom properties (`padding_mode: overlay` skips root padding; use `section-frame__overlay-padding` / `section-frame__overlay-safe-top` on descendants). `height_kind`: `content`, `media`, `stage`, `stage-pc`. `root_attrs` is for static `data-component-*` (or similar) only — never `data-module-id`, `x-data`, or other Alpine attributes; those belong on an inner element in `children` so import-map and Alpine expression lints match `HEAD` mount topology. |
| `heading` | `level`, `tier`, `align`, `content` | Visual tier separate from outline level |
| `text` | `tier`, `rte`, `subtitle`, `align`, `measure`, `content` | Body tiers on `p` or `div` |
| `button` | `href`, `style`, `size`, `label` / `content`, `new_tab`, `disabled` | Plain links stay on `link.liquid` |
| `content-group` | `align`, `gap` (`tight` / `related` / `group`), `children` | Stacks copy and actions; not a generic flex wrapper |

Captured `children` strings are the slot for nested markup. Raw `class` parameters remain escape hatches per the rules above.
