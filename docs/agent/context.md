# Current Project Context

This file is the short cross-session handoff for the current branch. `AGENTS.md` remains the repository rule source. Git history is the record for completed packages and superseded audit detail.

## Current State

- Branch: `feat/ai-test`.
- Theme-code baseline before this documentation cleanup: `597e819 fix(theme): finalize section presets and editor previews`.
- The branch was clean and synchronized with `origin/feat/ai-test` after that commit.
- No known theme-code defect remains from the former `temp commit` preset work.
- The user's Theme Editor QA passed for the corrected preset previews.

## Latest Preset And i18n Decision

- `presets[].settings` and `presets[].blocks[].settings` are preset instance values, not schema-locale copy.
- Do not place `t:` locale references in those preset values. Shopify does not resolve them there.
- Omit preset settings when the schema default already produces the intended result.
- A preset block should contain only its `type` unless it needs a real, non-default override.
- Keep `t:` for supported schema-localizable fields such as names, labels, help text, option labels, and preset names.

Project-wide audit after `597e819`:

- 28 section presets and 56 preset blocks were structurally valid.
- No unsupported `t:` value remained in preset instance settings.
- No preset value duplicated its schema default.
- No unused `preset_blocks` locale namespace remained.
- The only explicit preset overrides left were intentional: Footer headings `Pages` and `Social`, plus three icon choices in Icon with text.
- `npm.cmd run lint`, `npm.cmd test`, Shopify theme validation, and `git diff --check` passed.

## Remaining Work

There is no currently identified project-code package to implement. The remaining launch work is external, release-oriented, or evidence-based:

- Confirm public documentation and support operations outside this repository.
- Complete asset and dependency provenance records.
- Produce and smoke-test the final submission ZIP.
- Capture the required Lighthouse performance and accessibility evidence.
- Finalize demo-store presentation, listing copy, screenshots, release notes, and reviewer instructions.
- Submit to Shopify and address concrete reviewer feedback.

`config/settings_schema.json` already contains the project documentation and support URLs. Their external content and operating readiness are not a theme-code task and were intentionally not re-audited during the latest work.

## Reopen Conditions

Create a new code package only when a reproducible storefront or Theme Editor defect, a failed repository check, measured performance evidence, or Shopify reviewer feedback identifies a concrete issue. Do not restart the completed historical blocker packages from the old audit.

Protected merchant-owned files remain unchanged unless the user explicitly authorizes them:

- `config/settings_data.json`
- `templates/*.json`
- merchant content, navigation, uploaded media, and color-scheme values
