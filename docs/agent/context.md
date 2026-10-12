# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-13.

## 6-D3 Font picker defaults to Instrument Sans

**Status:** accepted and authorized by the user 2026-10-13 ("同意" to the board finding: schema defaults to `instrument_sans_n4`). Executed by the coordinator (two values).

**Outcome:** `type_header_font` and `type_body_font` in `config/settings_schema.json` default to `instrument_sans_n4` instead of `mono` (system monospace), matching `design.md` and the 6-D2 preset. Rendering on the dev store does not change: `config/settings_data.json` sets both to `instrument_sans_n4` (current and preset).

**Sources (Shopify Dev MCP, 2026-10-13):** a `font_picker` default is required and must be a real font handle; `mono` is the system monospace handle (shopify.dev, "Eliminate font loading delays with system fonts"); `instrument_sans_n4` is listed in the font library (shopify.dev, "Fonts", available fonts: Instrument Sans `instrument_sans_n4` … `instrument_sans_i7`).

**Review tier:** Ask (`config/settings_schema.json`).

**Implementation surface:** the two `default` values in `config/settings_schema.json`; this file. Forbidden: `config/settings_data.json` and everything else.

**Acceptance checks:**
1. `git diff HEAD -- config/` changes exactly the two `default` values.
2. `npm.cmd run test:theme-check`, `npm.cmd run lint:theme`, `npm.cmd run lint:i18n` pass; `npx prettier --check config/settings_schema.json` passes.
3. Shopify Dev MCP `validate_theme` (or Theme Check) reports no font-picker error.


**Executed (coordinator, 2026-10-13):** both defaults set to `instrument_sans_n4`. `git diff HEAD -- config/`: exactly the two `default` lines. `npm.cmd run test:theme-check`: 152 files, no offenses. `npm.cmd run lint:theme`, `npm.cmd run lint:i18n` pass. `npx prettier --check config/settings_schema.json` passes. Shopify Dev MCP `validate_theme` on `config/settings_schema.json`: valid. Not accepted; Ask review pending.

**Independent review 1 (2026-10-13): PASS.** No findings.
