# Abstraction Boundary Reference

Shared-abstraction rules that are too long for `AGENTS.md`. `AGENTS.md` remains the rule source. Read this before extending a base class, a shared Alpine component, `ShopifyHttp`, `SectionRefresher`, or a pagination or refresh helper.

## Boundary Principle

A shared abstraction has a contract every consumer depends on. Extending it for one new case can break other consumers far from the change.

Inspect existing snippets, components, and utilities before adding one. Reuse one only when semantics, invariants, lifecycle, and ownership match.

Run the three-question gate before extending. If any answer triggers, do not extend. Extension is allowed only when the new use case shares the existing callers' core invariants. When you extend, name the invariants that stay unchanged in the task summary or review notes.

## Three-Question Gate

1. Invariants: does the new use case share the callers' invariants (target DOM identity, rendering context, lifecycle), or only surface syntax such as URL strings and fetch calls?
    - `sectionPagination` assumes the same section in the same page context, refreshed with different parameters. A collection tab that changes the collection pathname does not share that invariant.
2. Naming: does the new method or parameter read naturally on the existing class? An awkward name such as `sectionPagination.loadCollectionTab()` is a mis-fit.
3. Branching parameter: are you adding an enum or boolean that switches core behavior, not a side effect?
    - Side-effect toggles such as `updateHistory`, `silent`, or `signal` are fine.
    - Core-behavior toggles such as `refreshMode: 'full' | 'partial'` or `mode: 'replace' | 'append'` are not.

## Resolution When The Gate Triggers

Pick one, in this order:

1. A simpler local solution: native page navigation, or inline logic at a true one-off call site.
2. A new component with one responsibility, even if it repeats a few lines.
3. Refactor the existing abstraction only after the new boundary is understood.

Do not add a parameter to a public method just to make a divergent case work.

## Anti-Patterns

| Bad | Correct |
| --- | --- |
| Add `mode: 'a' \| 'b'` to a shared method for a divergent case | New method or component with one responsibility |
| Add a `data-*` on a shared root that only one branch reads | Pass it at the call site, or scope it to the consumer |
| Reuse a base class because the URL pattern looks similar | Compare invariants, not surface syntax |
| Copy a hot snippet into a shared base class to make it reusable | Wait for a third real consumer before generalizing a JS abstraction (the CSS shared-layer threshold is in `docs/references/style-system/css-architecture.md`) |
| Rename a near-copy instead of extending or splitting on purpose | New component, or an explicit extension when invariants match |

Decorative full-bleed shapes use the `section-frame` `background` slot with icon assets rendered through the `icons` snippet. `lint:theme` `raw-svg` forbids inline SVG in Liquid.

## Snippet API Semantics

1. **Semantic variants over raw class params.** Expose semantic parameters (for example `size: 'sm'`, `style: 'outline'`) that map to internal classes. Do not expose a raw `class` parameter as the primary customization.
2. **Raw `class` is an escape hatch.** It may exist for a documented one-off that does not warrant a new variant. Document it as an escape hatch.
3. **Do not split a snippet only because it is long.** Split when the parts have different consumers, lifetimes, or contracts.
4. **Defaults must be safe.** An omitted parameter renders a correct, visible, accessible result. It must not produce broken HTML, invisible content, or missing ARIA.

Storefront control appearance and typography tiers are owned by `tailwind/tailwind.elements.css` and `tailwind/tailwind.typography.css` (Style ownership in `docs/references/style-system/css-architecture.md`). Primitives own structure and behaviour. They are preferred entry points, not mandatory ones.

## Layout primitives

Parameter lists live in each snippet's `{% doc %}` block:

- `snippets/section-frame.liquid`
- `snippets/heading.liquid`
- `snippets/text.liquid`
- `snippets/button.liquid`
- `snippets/content-group.liquid`

Guidance those blocks do not carry: `scheme_target: none` leaves the scheme class off the frame and the section writes `color-{{ section.settings.color_scheme }}` itself; `section-frame__overlay-safe-top` on a top block supplies the first-section header offset when padding is overlay; `clip: false` adds `section-frame--no-clip`. Put Alpine mount attributes on an inner element in `children`, so the import-map and Alpine expression lints see the mount on that element. `content-group` is not a generic flex wrapper.

Captured `children` strings are the slot for nested markup. Raw `class` parameters remain escape hatches per the rules above.
