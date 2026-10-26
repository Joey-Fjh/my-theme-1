# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-26.

## Plan HP3: heading hierarchy at 390 (backlog group 4, part B)

**Outcome.** At 390 the home headings follow `design.md`: the hero is the largest (`title-4xl`), section headings sit two steps below it (`title-xl`), and the `scatter-gallery` statement reads as a statement (`title-m`); no section heading is at body size except where the design makes it a label.

**Decided (user, 2026-10-26).** Preset values for the hero, `collection-list` and `scatter-gallery`; code for `promo-bannder`, `testimonial-featured` and `ritual-steps`. Authorized editing `templates/index.json` for this. `ritual-steps` style B's section heading stays a small italic label: it is `copy-m` on desktop too, so raising it only on mobile would make mobile larger than desktop; its step headings carry the hierarchy.

**Evidence (coordinator, 2026-10-26, 390, Chrome DevTools MCP).** Visible top headings: hero `title-2xl` 42px (the 30px H1 is the screen-reader title); `collection-list` 20 (`title-m`, preset); `scatter-gallery` 14 (`title-xs`, preset); `promo-bannder` 17 (`title-s`, hard-coded mobile tier); `testimonial-featured` 20 (`title-m`, hard-coded); `ritual-steps` A 20 (`title-m`, hard-coded), B 12 (`copy-s`, label); `scroll-categories` and `blog-stories` 42 (`title-2xl`).

**Implementation surface.** `sections/promo-bannder.liquid` and `sections/testimonial-featured.liquid` (the mobile tier in the `heading_size` mapping becomes the desktop tier capped at `title-xl`), `sections/ritual-steps.liquid` (style A section heading mobile tier `title-xl`), `templates/index.json` (`heading_size_mobile`: hero `title-4xl`, `collection-list` `title-xl`, `scatter-gallery` `title-m`).

**Review tier.** Ask (Liquid markup), plus the user's look at 390 and 768.

**Estimate:** 1.5 hours plus the Ask review.

**Checkpoint:** after the screenshots, before the review.

**Bar:** Must fix: a word split or horizontal scroll at 390 from the larger sizes; a desktop size change (tablet tiers unchanged); a schema change. Accepted residue: `scroll-categories` and `blog-stories` stay `title-2xl` (one step above the other section headings, as set by their presets). Judged on the default preset.

**Acceptance checks.**
1. Script at 390: hero headline about 60px and the largest heading on the page; `collection-list`, `promo-bannder`, `testimonial-featured`, `ritual-steps` A at `title-xl`; `scatter-gallery` at `title-m`; no heading line breaks inside a word.
2. Script at 1440: every changed section's heading size equals its value before the change.
3. `npm.cmd run lint:theme`, `npm.cmd run test:theme-check`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run test:layout -- --widths 390,768,1024,1440` with 0 new issues.
4. Screenshots at 390 for the user; the commit carries a `Merchant-Change:` trailer.

**History.** Authorized by the user 2026-10-26 ("可以"); implemented by the coordinator in this session.

**Validation (coordinator, 2026-10-26, Chrome DevTools MCP).**
1. Check 1, 390 (mobile emulation): hero headline 61px, the largest; `collection-list` 35, `promo-bannder` 35, `testimonial-featured` 35, `ritual-steps` A mobile heading 35; `scatter-gallery` 20; `featured-product` title 35 (unchanged); `scroll-categories` and `blog-stories` 42 (unchanged); `ritual-steps` B label 12 (unchanged, by decision). No heading line breaks inside a word; `scrollWidth` 390.
2. Check 2, 1440: hero 95.4, `collection-list` 48.8, `scatter-gallery` 25, `promo-bannder` 48.8, `testimonial-featured` 61, `ritual-steps` A 95.4, each its desktop tier; the diff changes only the mobile half of each tier and only `heading_size_mobile` values in the preset.
3. Check 3: `lint:theme` passed; `test:theme-check` 157 files, no offenses; `lint:liquid-syntax` passed; `test:layout -- --widths 390,768,1024,1440` 0 new issues; Prettier on the changed section files passed.

**Review 1 (external Verifier, 2026-10-26): FAIL**, one finding: no `frontend-design` output recorded, which `AGENTS.md` requires for typography direction. Storefront proven: 390 hero 60.78px and largest, section headings 35.07, `scatter-gallery` 20.24; 1440 unchanged when rebuilt with the previous mobile classes; both mappings cap mobile at `title-xl` in all cases; exactly the three authorized preset values changed; no scope violation.

**Correction (coordinator, 2026-10-26): `frontend-design`** (`.agents/skills/frontend-design/SKILL.md`, applied to this plan; it ranks below `design.md` and the project rules).
- "Set a clear type scale ... with intentional weights, widths, and spacing": the change moves the 390 headings onto the existing scale's roles (hero `title-4xl`, section `title-xl`, statement `title-m`) instead of five unrelated sizes from 12 to 42px; no new size.
- "When type is used as a headline or visual element, use the type treatment itself as an active part of the design" and "Spend your boldness in one place": the hero becomes the single largest type moment on mobile (61px against 35 to 42 elsewhere), matching `design.md`'s very large hero with section headings two to three steps below.
- "Visual structure is information": `ritual-steps` style B keeps its small italic heading as a label, since its step headings carry the content.
- Not adopted, for the user at the polish pass: the skill lists all-caps labels as a generated-design default; the hero and several section headings are uppercase by `design.md`.

**Review 2 (external Verifier, correction, 2026-10-26): PASS.** The `frontend-design` entry quotes the skill accurately and leaves the unadopted suggestion to the user; the four implementation files match review 1.

**User look (2026-10-26):** accepted at 393 (iPhone 16 emulation), "外观上我没发现什么不太好的".

**Status.** Executed and reviewed; waiting for the commit, then this plan is cleared.
