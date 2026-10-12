# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-12.

## 6-V5 Class token extraction inside brackets

**Status:** accepted by the user 2026-10-12 ("写吧" on the board proposal) and **authorized 2026-10-12 ("go ahead")**. Executor: the coordinator. Executed 2026-10-12. Review rounds 1 and 2 FAILed (class strings in JavaScript arrays were hidden); corrected. Review round 3: PASS. Complete; waiting for the commit.

**Outcome:** `classCandidateTokens` sees whole Tailwind arbitrary-value tokens, so `legacy-*`, `raw-spacing`, `raw-colour` and `unloaded-font-weight` can no longer miss `p-[5%]`, `px-[calc(100%-2rem)]`, `pc:grid-cols-[36%_minmax(0,1fr)]` or `text-ink/[40%]`. Today's counts do not change.

**Evidence:** probe (coordinator, 2026-10-12; split only outside brackets, no `%` skip). On the pre-6-R1 tree (`b9076a6`) it finds 6 hidden `legacy-breakpoint` uses, which are the 6 that 6-R1 fixed by hand. On today's tree it finds 0 hidden uses for every rule.

**Dependencies:** none.

**Review tier:** Ask (validator code under `.agents/`).

### Items

1. **Tokenizer.** In `.agents/skills/check-theme-architecture/scripts/lib/migration-lint.js`, `classCandidateTokens` splits a region into tokens:
   - always on whitespace;
   - on quotes, backticks, `{`, `}`, `,`, `(` and `)` only when outside `[...]`. Bracket depth is counted within a token and resets at whitespace, so an unbalanced `[` cannot swallow the rest of a region.
   - Token offsets and lines stay as today.
2. **Skips.** Drop the `%` skip. Keep the skip for tokens that contain `{` (Liquid-glued).
3. **Fixtures** in `.agents/skills/check-theme-architecture/scripts/theme-architecture.test.js`:
   - `p-[5%]` and `px-[calc(100%-2rem)]` count as `raw-spacing`;
   - `pc:grid-cols-[36%_minmax(0,1fr)]` and `max-pc:h-[48%]` count as `legacy-breakpoint`;
   - a raw colour with a `%` or comma arbitrary value is rejected by `raw-colour`;
   - an Alpine `:class="{ 'pc:flex': open, 'hidden': !open }"` still yields `pc:flex` and `hidden`;
   - an unbalanced `[` stops at the next whitespace;
   - a Liquid-glued token is still skipped.
4. **Reference.** `docs/references/style-system/css-architecture.md`, Migration lints, "What is counted": one line saying that tokens split only outside `[...]` and that `%` is no reason to skip.

### Implementation surface

`.agents/skills/check-theme-architecture/scripts/lib/migration-lint.js`, `.agents/skills/check-theme-architecture/scripts/theme-architecture.test.js`, `docs/references/style-system/css-architecture.md` (one line), and the record files.

Forbidden: baselines (`migration-baseline.json` and every other baseline), theme files, and any other lint.

### Acceptance checks

1. **Counts unchanged:** before and after, a script prints the hit totals of all four consumers over `layout/`, `sections/` and `snippets/`: `collectMigrationCounts`, plus the `raw-colour` and `unloaded-font-weight` failure counts from `lint-theme.js`. The before run happens before the first edit. The totals are identical, and `git diff` shows no baseline change.
2. **Fixtures:** each item 3 fixture fails on the old tokenizer and passes on the new one. Shown by running the new tests against `HEAD`'s `migration-lint.js` copied to `%TEMP%`, or by an equivalent proof.
3. `npm.cmd run test:theme-architecture` and `npm.cmd run lint:theme` pass.
4. `npm.cmd run lint:doc-paths` and `npm.cmd run doctor:agent` pass.
5. `npx prettier --check` passes on the changed files.

### Progress

- **Before** (probe `%TEMP%/v5/counts.cjs`, run before the first edit): migration `legacy-type-tier` 6, `raw-spacing` 658, `legacy-breakpoint` 0; markup `raw-colour` 0 and `unloaded-font-weight` 0 with no `lint-allow` applied; 12645 tokens.
- **After** (same probe): identical rule totals; 12524 tokens. The token list diff (`%TEMP%/v5/tokens.cjs`) shows only merges: whole arbitrary values (`tablet:grid-cols-[36%_minmax(0,1fr)]`, `ease-[cubic-bezier(0.22,1,0.36,1)]`), plus non-class `%` strings (`%Y-%m-%d`, `%%MIN%%`) that no rule matches. No baseline changed.
- **Code:** `splitClassTokens` in `migration-lint.js`; the `%` skip is dropped, and the brace skip is kept. A side effect: `raw-colour` now sees opacity modifiers written with `[…%]` or `(--var)`.
- **Fixtures:** three tests (`6-V5` in `theme-architecture.test.js`). All three fail against `HEAD`'s `migration-lint.js` (copied to `%TEMP%/v5/old`, run with `NODE_PATH` set to the repo `node_modules`) and pass on the new code. A font weight fixture is not needed: its rule matches only named utilities, which contain no brackets.
- **Validators:** `npm.cmd run test:theme-architecture` 232/232; `lint:theme`, `lint:doc-paths` pass; `doctor:agent` exit 0; Prettier passes on the 5 changed files.
- **Review round 1 (2026-10-12): FAIL.** (1) High: any `[` opened bracket mode, so `:class="['body-md','pc:p-4']"`, computed keys and property access became one token, and all five rules lost those hits. (2) Medium: the token diff held 4 non-Tailwind array changes (`blog:18`, `cart-overlay:41`, `collection:4`, `search-results-tabs:48`).
- **Correction:** `opensTailwindBracket`: a `[` opens a bracket only after `-`, `/` or `:` inside a token, or at a token start as an arbitrary variant or property (`[&`, `[@`, `[name:`, `[--name:`). New test `6-V5 review` covers compact arrays, computed keys, property access, the five rules on an array, and the arbitrary variant and property forms. It passes on `HEAD` (it guards `HEAD`'s behaviour) and fails on the round-1 tokenizer (`%TEMP%/v5/r1`). The other three 6-V5 tests still fail on `HEAD`. The reference line now says when a bracket opens.
- **After the correction:** probe totals identical to before (`legacy-type-tier` 6, `raw-spacing` 658, `legacy-breakpoint` 0, `raw-colour` 0, `unloaded-font-weight` 0); 12533 tokens. Token diff against `HEAD`: 209 removed / 97 added, and every removed token is contained in an added token at the same location (0 lost). Added tokens are Tailwind bracket merges or `%` strings only; the 4 array locations match `HEAD` again. `test:theme-architecture` 233/233, `lint:theme` pass, Prettier pass.
- **Review round 2 (2026-10-12): FAIL.** (1) High: a `[` after any `:` still opened a bracket, so compact `{classes:['body-md','pc:p-4']}`, nested objects and `open?[…]:[…]` lost every hit of all five rules. (2) Medium: `[mask:url(text-black)]` loses the `raw-colour` hit that `HEAD` reported on the word `text-black` inside the arbitrary value.
- **Correction 2:** whitespace and quotes always split, even inside a bracket; braces, commas and parentheses split only outside one. Class strings in JavaScript are always quoted, so no bracket can hide one, whatever precedes the `[`. Finding (2) is kept as intended: a word inside one arbitrary value is not a class, and `HEAD`'s hit there was a false positive. The reference line says so. **This narrows the round-1 "no hit lost" check** to whole words (bounded by whitespace, a quote or the region edge); the user is told.
- **Proof:** a fuzzer (`%TEMP%/v5/fuzz.cjs`, 20000 generated Alpine expressions and class lists) checks that every `HEAD` token that is a whole word stays a token at the same offset. Current code: 0 lost. Round-2 code (`%TEMP%/v5/r2`): 3671 lost. A seeded version (2000 expressions: every quoted class string is its own token at its offset) is the new test `6-V5 review 2`. It fails on the round-2 tokenizer and passes on the working copy. On `HEAD` it fails only on the `[mask:url(text-black)]` assertion, which is the intended change.
- **After correction 2:** repository totals identical (`legacy-type-tier` 6, `raw-spacing` 658, `legacy-breakpoint` 0, `raw-colour` 0, `unloaded-font-weight` 0); 12533 tokens; diff against `HEAD` 209 removed / 97 added, 0 lost. Added tokens without a bracket are `%` strings only. `test:theme-architecture` 234/234; `lint:theme`, `lint:doc-paths` pass; `doctor:agent` exit 0; Prettier passes.
- **User decision (2026-10-12):** the user ran review round 3 with the narrowed whole-word guarantee, accepting that words inside one Tailwind arbitrary value are not classes.
- **Review round 3 (2026-10-12): PASS**, no findings. 127 files and 4051 adversarial cases: no whole-word token or hit lost, offsets and lines correct. Repository totals unchanged; 209 removed / 97 added tokens; intended gains hold. The non-whole-word hits lost are all fragments inside one arbitrary value: `[mask:url(…)]` words, and `]:pc:p-4` inside `[@media(min-width:48rem)]:pc:p-4`, where the whole class still gives both hits.
