# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-09-30.

## Plan: entry scripts in a snippet (batch 5-S)

Status: authorized by the user (2026-09-30, "开始"); implemented, reviewed (GPT PASS), accepted by the user. 5-H is committed (`2683402`, record in `git show 2683402:docs/agent/context.md`). Direction accepted by the user (2026-09-30), organized as Horizon does (code not copied). Review tier: **Ask** (Liquid in `layout/` and `snippets/`, validator code, `AGENTS.md`). Implementer: coordinator (small change); reviewer: GPT, which also runs the browser smoke check.

**Outcome.** `layout/theme.liquid` renders one snippet, `snippets/scripts.liquid`, that holds the import map, the `base.js` module entry, and the Alpine classic `defer` script with their order comments, unchanged in content and order. The validator reads the import map from that snippet and fails loudly when the snippet, its import map, or the layout's render of it is missing. Rendered HTML of `<head>` is unchanged apart from whitespace.

**Dependencies.** None; 5-H is committed.

**Implementation surface.**

- `snippets/scripts.liquid` (new): the three blocks moved verbatim from `layout/theme.liquid` (sections 1–3 and their comments), with a header comment stating that it renders once, in `<head>`, before `content_for_header`, and that the order import map → `base.js` → Alpine must not change.
- `layout/theme.liquid`: those blocks replaced by `{% render 'scripts' %}` at the same position (after the stylesheet, before `content_for_header`). Nothing else changes.
- `.agents/skills/check-theme-architecture/scripts/lib/theme-contracts.js` (`collectModuleRegistrationFailures`): read the import map from `snippets/scripts.liquid`; report failures against that file; new failures: the snippet is missing or holds no parsable import map, and `layout/theme.liquid` does not render `'scripts'`. The `hasThemeLayout` gate in `lint-theme.js` stays.
- `.agents/skills/check-theme-architecture/scripts/theme-architecture.test.js`: `writeMinimalImportMap` and the four import map tests write the snippet (and a layout that renders it); new tests for the three new failures.
- `AGENTS.md` (Runtime constraints, the "No bundler" line), `docs/references/architecture/javascript-runtime.md` (module discovery sentence and Script Load Order), `docs/references/code-review/browser-compatibility.md` (the classic-script sentence): name `snippets/scripts.liquid`, rendered by `layout/theme.liquid`.
- `docs/project.md` (Deviations From The Skeleton): one line recording 5-S as a skeleton deviation under the sync policy.

**Acceptance checks.**

- S1: `git show HEAD:layout/theme.liquid` lines of the three blocks equal `snippets/scripts.liquid` content apart from the new header comment and indentation (`git diff --no-index -w` on the extracted ranges, or equivalent).
- S2: `grep -c "importmap" layout/theme.liquid` → 0; `grep -n "render 'scripts'" layout/theme.liquid` → exactly one line, before `content_for_header` and after the stylesheet tag.
- S3: `npm.cmd run lint:theme` passes on the change; and it fails (each checked, then reverted by editing, never by git restore/checkout/stash) when: the snippet's import map lacks an id used by `data-module-id`; the `render 'scripts'` line is removed from the layout; the snippet is renamed away.
- S4: `npm.cmd run test:theme-check`, `npm.cmd run test:theme-architecture`, `lint:compat`, `lint:doc-paths`, `doctor:agent` (environment permitting), Prettier on changed files.
- S5 (reviewer, browser MCP): on `/` and one product page, the rendered `<head>` has the import map, then `base.js` as a module, then `vendor-alpine.min.js` with `defer`, all before the `content_for_header` scripts; 0 console errors, 0 held module roots, 0 uninitialized `x-data` roots; one Theme Editor section reload shows no error (user).

## Progress

Implemented by the coordinator (2026-09-30), uncommitted, not reviewed.

- `snippets/scripts.liquid` created: a header comment (renders once in `<head>` before `content_for_header`; order import map → `base.js` → Alpine), then `layout/theme.liquid` lines 23–108 of `HEAD` dedented by 8 spaces. `layout/theme.liquid`: those lines replaced by `{% render 'scripts' %}`.
- `theme-contracts.js`: `parseImportMapEntries` returns `null` when no import map is found or its JSON does not parse (was an empty map, which surfaced only as every `data-module-id` "missing"); `collectModuleRegistrationFailures` requires `{% render 'scripts' %}` in the layout, reads the map from `ENTRY_SCRIPTS_SNIPPET` (`snippets/scripts.liquid`), reports a missing or unparsable map, and reports map failures against the snippet.
- Tests: `writeEntryScripts` helper (layout rendering the snippet plus the snippet); `writeMinimalImportMap` and the four import map tests use it; four new tests (layout without the render fails; missing snippet fails; unparsable map fails; map in the snippet passes).
- Docs: `AGENTS.md` "No bundler" line, `javascript-runtime.md` (module discovery sentence, Script Load Order intro with the lint guard), `browser-compatibility.md` (classic-script sentence), `docs/project.md` deviation entry for 5-S.

Validation:

- S1 pass: `git diff --no-index -w` between `HEAD:layout/theme.liquid` lines 23–108 and the snippet after its header comment reports no difference.
- S2 pass: `importmap` count in `layout/theme.liquid` 0; `render 'scripts'` on line 23, after the stylesheet (line 21), before `content_for_header` (line 25).
- S3 pass, each on the real tree, restored from a scratch copy and confirmed byte-identical with `cmp`: dropping the `card-gallery` entry → `snippets/scripts.liquid:1: data-module-id "card-gallery" is missing from the import map.`; dropping the render line → `layout/theme.liquid:1: layout/theme.liquid must render 'scripts' …`; renaming the snippet → `snippets/scripts.liquid:1: snippets/scripts.liquid must exist and hold one parsable <script type="importmap">.` (plus the missing ids). Restored tree: `lint:theme` passes.
- S4: `test:theme-architecture` 109/109; `test:validators` exit 0; `test:theme-check` 142 files, no offenses; `lint:compat` exit 0; `lint:doc-paths` pass; `lint:liquid-syntax` pass; Prettier on the eight changed files pass. `doctor:agent` exit 1: `smol-toml` missing from `node_modules` on this machine (environment, unchanged from 5-H).

- GPT review (2026-09-30): **PASS**, no findings. S1–S4 re-verified (S3 by code reading and tests; live mutations not rerun, read-only role); S5 in the browser on `/` and `/products/floral-white-top`: head order import map → `base.js` module → deferred Alpine, all before `content_for_header`; 0 held roots, 0 uninitialized roots, 0 theme console errors. The missing-favicon request it saw is the browser default `/favicon.ico`: `snippets/meta-tags.liquid` emits a favicon link only when `settings.favicon` is set (merchant setting, not this batch).

- Theme Editor section reload (user, 2026-09-30): no theme error. **All acceptance checks S1–S5 pass.**
