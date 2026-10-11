# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-11.

## 6-V3 Validator tidy-up (from the lint necessity audit)

**Status:** authorized by the user 2026-10-11 (coordinator executes); executed; review rounds 1-5 FAIL on item 1; item 1 dropped by the user after round 5; review round 6 PASS on items 2-3; awaiting user acceptance.

**Outcome:** each colour violation is reported once without weakening any rule, the SKILL.md check table matches the code, and CI runs `doctor:agent`.

**Review tier:** Ask (validator code and CI wiring are user-owned harness).

**Dependencies:** none.

### Items

1. **Colour lint overlap.** `settings-chain-css-color` (`lib/theme-contracts.js`, `collectSettingsChainCssFailures`) and `raw-colour` (`lib/raw-colour-lint.js`, `collectCssRawColourFailures`) both run on `{% stylesheet %}` blocks and on the CSS source files in `lint-theme.js`; a literal hex or `rgb(` value fails both.
    - First close the one gap: `settings-chain-css-color` rejects `hsl(` / `hsla(` with any argument (for example `hsl(var(--x))`), `raw-colour` only with a numeric first argument. Extend `raw-colour` so it rejects every value `settings-chain-css-color` rejects, in the files both scan.
    - Then stop `settings-chain-css-color` from running where `raw-colour` runs. It keeps running on the files `raw-colour` excludes (`tailwind/tailwind.input.css`, `assets/gift-card.css`), so nothing is checked less than today.
    - The typography half (`settings-chain-css-typography`) is unchanged.
    - If the existing code makes a clean split impossible, stop and report instead of restructuring.
2. **SKILL.md check table.** Add the 11 check ids that run but are missing from "What `lint:theme` Covers" in `.agents/skills/check-theme-architecture/SKILL.md`: `colour-setting`, `unloaded-font-weight`, `stylesheet-media-query`, `legacy-breakpoint`, `legacy-type-tier`, `raw-spacing`, `stylesheet-layer`, `stylesheet-font-size`, `mixed-element` (and any other id the code emits that the table lacks). Describe each from its code, one line; mark the ratchets. Update the `settings-chain-css-color` and `raw-colour` rows for item 1.
3. **CI.** Add `npm run doctor:agent` to the `lint` job in `.github/workflows/ci.yml`. First check that it can pass on a Linux runner (symlinks checked out by `actions/checkout`, no local MCP config required); if it cannot, stop and report.

### Implementation surface

`.agents/skills/check-theme-architecture/scripts/lib/theme-contracts.js`, `.agents/skills/check-theme-architecture/scripts/lib/raw-colour-lint.js`, `.agents/skills/check-theme-architecture/scripts/lint-theme.js`, `.agents/skills/check-theme-architecture/scripts/theme-architecture.test.js`, `.agents/skills/check-theme-architecture/SKILL.md`, `.github/workflows/ci.yml`, and `.agents/tools/doctor-agent.mjs` only if item 3 needs a CI-safe mode.

### Acceptance checks

1. A fixture with each value class `settings-chain-css-color` rejected before (non-black/white hex, `rgb(` / `rgba(` with numbers, `hsl(` / `hsla(` including `hsl(var(--x))`, the named colours in its list) in a `{% stylesheet %}` block and in a `tailwind/*.css` file yields exactly one colour failure each, from `raw-colour`.
2. The same values in `tailwind/tailwind.input.css` and `assets/gift-card.css` still fail as before (fixture).
3. Allowed values (`var(--color-*)`, `rgb(var(--color-*))`, roles, `transparent`, `currentColor`, `inherit`) pass in both scopes.
4. `npm.cmd run lint:theme` passes on the real theme with no new `lint-allow`; the failure count by id on HEAD and after differs only in removed duplicates (record both).
5. Every check id the code can emit appears in the SKILL.md table (list the ids from code and diff them against the table).
6. `npm.cmd run doctor:agent` passes locally; the CI step is present; its Linux feasibility is stated with evidence.
7. `npm.cmd run test:theme-architecture`, `npm.cmd run lint:doc-paths`, `npx prettier --check` on changed files pass.

### Progress

Executed by the coordinator, 2026-10-11.

- **Item 1:** `raw-colour` gained `{ re: /\bhsla?\(/i, reason: 'hsl() colour' }` (the one value class only the old check rejected). `collectSettingsChainCssFailures` takes `colour` (default true); `lint-theme.js` passes `colour: RAW_COLOUR_EXEMPT_FILES.has(file)` for `{% stylesheet %}` blocks and CSS source files (`EXEMPT_FILES` now exported from `raw-colour-lint.js`). Inline `style` attributes were never scanned by the old check, so nothing changes there. No restructuring was needed.
- **Tests:** the seven `settings chain css color …` tests moved from `tailwind/fixture.css` to `assets/gift-card.css` (the scope the old check keeps). New: `6-V3: raw-colour alone reports …` (6 literal values and the 15 named colours, in a CSS file and a `{% stylesheet %}` block, each exactly one `raw-colour`), `6-V3: settings-chain-css-color still runs where raw-colour is exempt` (both exempt files), `6-V3: allowed colour values pass in both scopes`.
- **Item 2:** nine rows added (`colour-setting`, `unloaded-font-weight`, `stylesheet-media-query`, `legacy-type-tier`, `raw-spacing`, `legacy-breakpoint`, `stylesheet-layer`, `stylesheet-font-size`, `mixed-element`; the audit's "11" counted these nine), each written from its code; ratchets marked with their baseline file and "retires at 0". `settings-chain-css-color` and `raw-colour` rows updated. Diff of every check id literal in `scripts/lib/*.js` and `lint-theme.js` against the table: none missing.
- **Item 3:** `- run: npm run doctor:agent` after `test:validators` in the `lint` job. Linux feasibility (inferred from repo facts, not run on a runner): `CLAUDE.md` and `.claude/skills` are mode 120000 in the index, so `actions/checkout` creates symlinks on Linux; `.mcp.json`, `.cursor/mcp.json` and `.codex/config.toml` are tracked; `smol-toml` is in `package.json`, installed by `npm ci`. First proof on the next push.

**Validation:**

| Check | Result |
| --- | --- |
| 1-3 fixtures | pass (in `test:theme-architecture`) |
| 4 `lint:theme` on the real theme | pass before (HEAD `7486f12`) and after; 0 failures both, no new `lint-allow` |
| 5 ids vs table | 0 missing |
| 6 `doctor:agent` | exit 0 locally; CI step present |
| 7 `test:theme-architecture` | 232 pass / 0 fail; `lint:doc-paths` pass; prettier pass on the 6 changed files |

**Review round 1 (external Verifier, 2026-10-11): FAIL**, three findings. Corrections by the coordinator:

1. **P2 hsl false positive:** the pattern is now `(?<![\w-])hsla?\(`, so `custom-hsl(…)` / `my-hsla(…)` / `myhsl(…)` no longer match; fixture `6-V3 review: a function name ending in hsl( is not an hsl() colour`.
2. **P3 table pipe:** `black|white` in the `settings-chain-css-color` row escaped as `black\|white` (GFM renders `\|` as `|` inside a table cell, code spans included).
3. **P3 media description:** the `stylesheet-media-query` row now says the negated hover condition stands alone, otherwise `and`-joined width, reduced-motion and can-hover-pair atoms (matches `isAllowedStylesheetMedia`).

After the corrections: `test:theme-architecture` 233 pass / 0 fail, `lint:theme` pass, prettier pass.

**Review round 2 (external Verifier, 2026-10-11): FAIL**, one finding (P2): the hsl lookbehind excluded ASCII identifier characters only, so `éhsl(…)` / `éhsla(…)` still matched. The verifier also noted the older `literal colour function` pattern falsely rejects `custom-hsl(1)` (pre-existing on HEAD, same boundary class). Correction by the coordinator: both patterns now use the lookbehind `(?<![\w\-\\u0080-￿])` (identifier characters: word characters, hyphen, CSS escapes, any non-ASCII code point including surrogate halves). Fixtures: `custom-hsl(1)`, `custom-rgb(1 2 3)`, `éhsl`, `éhsla`, `érgb`, an emoji prefix and the escape `\68sl(1)` pass; real `hsl` / `HSL` / `HSLA` / `rgb` / `rgba` after a space, comma, `(` or at value start fail exactly once. `test:theme-architecture` 234 pass / 0 fail, `lint:theme` pass, prettier pass.

**Review round 3 (external Verifier, 2026-10-11): FAIL**, two findings, both from treating `\` as an identifier character: real escaped functions (`\rgb(1 2 3)`, `\hsl(…)`, `\hsla(…)`) passed (a weakening against HEAD, 12 of 600 probes), and longer escaped names (`\61 hsl(…)` = `ahsl(…)`) still failed. Correction by the coordinator: `rawColourValueReason` decodes CSS escapes first (`decodeCssEscapes`: hex escapes with their optional whitespace, and single-character escapes; invalid code points become U+FFFD), and the lookbehind drops `\` (word characters, hyphen, non-ASCII). The literal U+FFFF character the previous edit had written into the regex is now the escape `￿`. Fixtures: `\61 hsl(…)`, `\61 rgb(…)`, `\000061hsl(1)` pass; `\rgb(…)`, `\hsl(…)`, `\hsla(…)`, `\68sl(1)`, `\68 sl(var(--x))` fail once (round 2 had `\68sl(1)` wrongly in the pass list). `test:theme-architecture` 234 pass / 0 fail, `lint:theme` pass, prettier pass.

**Review round 4 (external Verifier, 2026-10-11): FAIL**, 22 new false positives from the escape decoder (`\28 hsl(…)` decoded to `(hsl(…)`, `\23 123` to `#123`, and a leading U+00A0), plus an escaped-EOF discrepancy. **Decision (coordinator, within the plan):** stop modelling CSS identifiers and escapes with regular expressions; return to the plan's goal (remove duplicates, weaken nothing). The round 1-3 lookbehinds and `decodeCssEscapes` are reverted; the `literal colour function` pattern is HEAD's again. `raw-colour` gains only `{ re: /^\s*hsla?\(/i, reason: 'hsl() colour' }`, the exact case the old colour check rejected (`isForbiddenColorValue`: the trimmed value starts with `hsl(` / `hsla(`), so every value HEAD accepted stays accepted. The review-round fixtures now assert that equivalence (`custom-hsl(var(--x))`, `my-hsla(…)`, `éhsl(…)`, `\61 hsl(…)`, `\28 hsl(…)`, `a,hsla(…)` pass; `hsl(` / `HSL(` / `hsla(` / `HSLA(` at value start fail once). The SKILL.md `raw-colour` row says the same. The regex limits (pre-existing `custom-hsl(1)` false positive, escapes not decoded) are filed on `docs/agent/board.md` as an accepted known limitation. `raw-colour-lint.js` differs from HEAD by 4 lines (the pattern with its comment, and the `EXEMPT_FILES` export). `test:theme-architecture` 234 pass / 0 fail, `lint:theme` pass, prettier pass.

**Review round 5 (external Verifier, 2026-10-11): FAIL.** A 9,760-comparison HEAD equivalence run showed the two colour checks are complementary, not nested: the old check rejects values `raw-colour` accepts (quoted or `url()` hex, `#123z`, `#112233foo`, hex inside a `var()` fallback: 24 lost failures), and the start-anchored hsl pattern rejects values the old check accepted (custom properties, a leading line break: 96 added failures). They parse value boundaries, quotes and `url()` differently, so neither can stand in for the other.

**Decision (user, 2026-10-11): item 1 dropped** (option A). `raw-colour-lint.js`, `theme-contracts.js`, `lint-theme.js` and `theme-architecture.test.js` are back to HEAD byte for byte; both checks keep running, and a value that breaks both is still reported twice. Acceptance checks 1-4 lapse with item 1. The batch is now item 2 (SKILL.md: nine rows, the media-query description, and the `black\|white` escape in the `settings-chain-css-color` row; the colour rows otherwise as on HEAD) and item 3 (CI `doctor:agent`). After the revert: `lint:theme` pass, `test:theme-architecture` 229 pass / 0 fail (HEAD's count), `lint:doc-paths` pass, `doctor:agent` exit 0, prettier pass.

**Review round 6 (external Verifier, 2026-10-11): PASS** for the reduced batch (items 2-3), no findings: scripts identical to HEAD, 49 emitted ids all in the table, 45 rows render as two cells, colour rows equal HEAD except the escape, CI step present, records accurate. Unproven: a real `ubuntu-latest` run (first proof on the next push).
