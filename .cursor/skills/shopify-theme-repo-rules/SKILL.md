---
name: shopify-theme-repo-rules
description: Repository-level rules for formatting, naming, vendor assets, safe edits, and file organization in this Shopify theme. Use when editing existing files, renaming assets, formatting code, or reorganizing project structure.
---

# Shopify Theme Repo Rules

## Formatting

1. Respect the repository Prettier, EditorConfig, and existing file conventions.
2. Use 4 spaces for indentation.
3. Prefer minimal diffs when editing existing files.
4. Do not reformat unrelated files as part of a feature change unless explicitly requested.
5. When formatting is required, format only the files being changed first.

## Vendor Assets

1. Never edit minified vendor files.
2. Vendor assets use `vendor-*.min.js` and `vendor-*.min.css` naming.
3. When renaming vendor assets, update all references consistently:
   - `layout/theme.liquid`
   - CSS imports
   - README / docs
   - ignore rules if needed
4. Do not use ambiguous names like `alpine.js` or `gsap.js` for vendor copies.

## Generated / Protected Files

1. Do not manually edit generated files such as `assets/tailwind.output.css`.
2. Do not format or rewrite minified files.
3. Do not introduce changes to ignored files unless explicitly asked.

## Edit Safety

1. Preserve existing project conventions before introducing new patterns.
2. Separate structural refactors from behavior changes when possible.
3. Prefer safe incremental edits over large rewrites.
4. Keep runtime changes, vendor renames, and formatting changes easy to review.

## Naming

1. Shared runtime files should use stable, descriptive names.
2. Feature logic must not be mixed into vendor files.
3. New files should align with the current runtime / feature / snippet structure.

## Repo Boundaries

1. Shopify theme runtime code lives in the supported theme directories.
2. Do not assume bundler-style module resolution or nested output structures.
3. Avoid introducing patterns that depend on a specific editor extension to work correctly.