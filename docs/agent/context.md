# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-26.

## Plan HC1: home composition (backlog group 4, part B)

**Outcome.** The default home reads as a sequence rather than a catalogue: the two `ritual-steps` styles are separated and no longer repeat each other, shopping comes earlier, and the header uses the left logo layout `design.md` describes. All 14 sections stay.

**Decided (user, 2026-10-26).** Keep both `ritual-steps` styles and all content, reorder only; style B becomes an evening ritual with its own heading and steps, as long as the look still follows the design; the header returns to the schema default `logo_position: left`. The user authorized editing `templates/index.json` and `sections/header-group.json` for this.

**Evidence.** The `impeccable` critique (2026-10-15, `git show cbc86bb:docs/agent/board.md`) ranked as P1 that `promo-bannder` followed by two `ritual-steps` with the same heading and steps read as a feature catalogue; `design.md` describes a left logo with adjacent navigation; the header schema default is `left` and the preset stored `middle-center`.

**Implementation surface.** `templates/index.json` (the `order` array; the `ritual_steps_carousel` heading and its three blocks' label, heading and text), `sections/header-group.json` (`logo_position`).

**Review tier.** Show (no Liquid, schema, JavaScript or CSS change; the user's look is the review).

**Estimate:** 30 minutes.

**Checkpoint:** after the edits and checks, before the commit.

**Bar:** Must fix: a Theme Check offence; a section or block lost or changed outside the surface; the header breaking at 390, 1024 or 1440. Accepted residue: the hero line break and the 390 heading sizes (group 4 part B code items, next). Judged on the default preset.

**Acceptance checks.**
1. The order is slides-show, scrolling-icon-with-text, collection-list, routine-showcase, featured-products, ritual-steps A, scatter-gallery, promo-bannder, featured-product, testimonial-featured, ritual-steps B, scroll-categories, blog-stories, icon-with-text; the section and block sets are unchanged (script comparing keys with `HEAD`).
2. `npm.cmd run test:theme-check` with no offences; `npm.cmd run test:layout` at 390 and 1440 with 0 new issues.
3. Header at 390, 1024 and 1440: logo left, navigation and icons in one row on desktop, no overlap (screenshots for the user).
4. The commit carries a `Merchant-Change:` trailer; `node .agents/tools/merchant-guard.mjs --range` passes before any push.

**History.** Authorized by the user 2026-10-26; implemented by the coordinator in this session.

**Validation (coordinator, 2026-10-26).**
1. Script against `HEAD`: same section keys, same order members, same block keys in every section; only `ritual_steps_carousel` changed in content (heading "The Evening Ritual"; steps Unwind, Repair, Rest with their own heading and text, similar lengths); order as listed in check 1.
2. `npm.cmd run test:theme-check`: 157 files, no offenses. `npm.cmd run test:layout -- --widths 390,1440`: 0 new issues.
3. Screenshots (Chrome DevTools MCP): 1440 and 1024 logo left, navigation centred, icons right, one row; 390 menu button, logo and icons in one row. The navigation is centred, not beside the logo as `design.md` describes; no setting places it there.
4. Seen on the way (group 4 part B code item, next): the `slides-show` headline breaks inside words at 1024 ("SLOWE / R", "MORNI / NGS") and the eyebrow overlaps the call to action there; at 1440 slide 1 sets "A" alone on a line.

5. User request at the look: the home `testimonial-featured` takes `marquee_width: "full"` in `templates/index.json` (schema default `page` unchanged).
6. User look (Show tier): accepted 2026-10-26 ("整体看过了没啥问题", then "我看到了变更。可以了").

**Status.** Executed and reviewed; waiting for the commit, then this plan is cleared.
