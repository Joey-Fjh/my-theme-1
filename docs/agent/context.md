# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-27.

## Plan PB1: `promo-bannder` panel schemes (backlog group 4)

**Outcome.** No `promo-bannder` panel fills with the accent: the home panels read sage, canvas, inverse ink, and a newly added panel defaults to sage.

**Decided (user, 2026-10-27).** Option C from board topic PB1: configuration and code default together. Governing rule: `docs/design/design.md` colour roles (`scheme-3` thin bands only, never a full content section) and principle 2 (the accent never fills large areas).

**Evidence.** `templates/index.json` `promo_bannder_QtDDTf` panels `card_4XMzQY` `scheme-4`, `card_kTMLfT` `scheme-2`, `card_botanical` `scheme-3`; the `card` block `color_scheme` default and the Liquid fallback are both `scheme-3` (`sections/promo-bannder.liquid`). `templates/index.json` is the only consumer.

**Dependencies.** Merchant-change authorization for `templates/index.json` (one value, `card_botanical` `color_scheme`), named in the commit's `Merchant-Change:` trailer.

**Implementation surface.** `sections/promo-bannder.liquid`: the `card` block schema `color_scheme` default and the `promo_panel_scheme` fallback, `scheme-3` to `scheme-4`. `templates/index.json`: `card_botanical` `color_scheme` `scheme-3` to `scheme-1`. Nothing else.

**Review tier.** Ask (Liquid schema change).

**Estimate:** 30 minutes plus the Ask review.

**Checkpoint:** after the validators, before the Ask review prompt.

**Bar:** Must fix: any panel text, link or focus ring under the `design.md` contrast floor on its scheme; a change outside the surface; a new `test:layout` issue. Accepted residue: the small image at about 72% of the panel (backlog design fidelity). Judged on the default preset and the current home template.

**Acceptance checks.**
1. `sections/promo-bannder.liquid` contains no `scheme-3`; the block default and the fallback read `scheme-4`.
2. The `templates/index.json` diff is exactly one value: `card_botanical` `color_scheme` to `scheme-1`.
3. `npm.cmd run scan:contrast` reports no new failure; the `scheme-1` pairs the panel uses (text, buttons, focus ring) meet the `design.md` contrast floor.
4. `npm.cmd run lint:theme`, `npm.cmd run test:theme-check` and `npm.cmd run lint:merchant` pass; `npm.cmd run test:layout -- --widths 390,768,1024,1440` reports 0 new issues.
5. The Ask review reports PASS; the user looks at the home panels.

**History.** Authorized by the user 2026-10-27 ("可以", covering the batch and the `templates/index.json` change); implemented by the coordinator in this session.

**Validation (coordinator, 2026-10-27).**
1. `sections/promo-bannder.liquid`: the fallback and the block default read `scheme-4`; no `scheme-3` left in the file.
2. `templates/index.json`: one line, `card_botanical` `color_scheme` `scheme-3` to `scheme-1`.
3. `scan:contrast`: `scheme-1` all pass (lowest: input placeholder and border, 4.75); the one failing pair, `scheme-4` text-subtle 4.45, is the known `design.md` weak spot, unchanged.
4. `lint:theme`, `test:theme-check` (157 files, no offenses), `lint:liquid-syntax`, `lint:compat` passed. `lint:merchant` takes only a commit range, so it runs on the commit (`--range HEAD~1..HEAD`). `test:layout -- --widths 390,768,1024,1440` (dev server started by the user): 0 new issues, all hits baselined. The IDE warning on the schema `disabled_on.groups` value `custom.overlay` is from before this change and Theme Check accepts it.

**Ask review (separate session, 2026-10-27): PASS, no defects.** Fresh runs of `lint:theme`, `test:theme-check`, `lint:liquid-syntax`, `lint:compat`, `scan:contrast`, `test:layout` (4 widths, 0 new), Prettier on both files: all pass. Semantic `templates/index.json` diff is one value; only the home template consumes `promo-bannder` (16 JSON files checked), panels now `scheme-4`, `scheme-2`, `scheme-1`. `scheme-1` text 10.36, button labels 11.78, focus ring blend at 40% opacity 3.04. Live panels inspected at 390 and 1440. Notes: `lint:merchant` runs on the commit with its `Merchant-Change:` trailer; the home panels carry no links or buttons, so keyboard interaction was not exercised.

**User look:** accepted 2026-10-27 ("目前看上去没有问题").

**Status.** Executed, reviewed (PASS) and accepted; waiting for the commit (`lint:merchant --range HEAD~1..HEAD` after it).
