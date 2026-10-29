# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-29.

## Plan RR1-D1: record corrections and the end-of-stage bundle

**Status:** implemented (coordinator, 2026-10-29). The user approved the `AGENTS.md` wording at the checkpoint ("可以", 2026-10-29). Ask review (external, 2026-10-29): **PASS**, no findings. All six acceptance checks were re-run and met; the line 1 placement in Record-layer checks was confirmed. **Batch complete; waiting for the user to ask for the commit.**

**Execution log (2026-10-29).**
- **R1.** The `position` sentence names only `sections/newsletter-banner.liquid`. The `placeholder_style` sentence is unchanged.
- **R2.** The carousel indicator paragraph is deleted. Nothing replaces it.
- **R3.** The Harness bullet says baseline 9. Roadmap item 5 records RR1-C and RR1-E (`061a180`), and names RR1-D1 and then RR1-D2 as next. Check 3: `git grep "baseline 40" -- docs/project.md` has one hit, the historical "layout baseline 40 → 9" in the RR1-B entry, which is a transition, not a stale figure. No stale "baseline 40" status is left.
- **Line 1 migration.** It goes into the Record-layer checks bullet that defines what the board holds, not into step 7. The recorded target was corrected per the plan, because step 7 defines reviews.
- **Line 2 migration.** It goes into step 9, ahead of the Pending migration sentence, and the Validation table `tailwind/**` row points to it.
- **Board.** Pending migration and Deferred ideas each read "None." with one line naming where the content went.
- **Checks.**
  - `wc -l AGENTS.md`: 173, unchanged (both rules are clauses in existing lines).
  - `lint:doc-paths` passed.
  - `doctor:agent` exit 0.
  - `lint:records`: 0 topics, 0 pending migration lines.
  - `npx prettier --check` on the changed files passed.
  - `git grep -i "carousel indicator" -- docs/references` returns nothing.

**Outcome.**
- The references and `docs/project.md` match the code and the decisions.
- The board's Deferred ideas are gone; `docs/project.md` already carries the "Not planned" line.
- The two Pending migration rules live in `AGENTS.md`, and the board's Pending migration section is empty.

After this batch, `docs/agent/board.md` holds no topics, migrations or deferred ideas. RR1-D2 (the checklist document) is the last group 8 item.

**Decided (user, 2026-10-29).**
- Option B of the RR1-D topic: this batch takes the records; the checklist is RR1-D2.
- R4: keep `theme_version` at `1.0.0`, so no schema change. The source is Shopify Dev MCP: the updates page requires a version number for updates to published themes, and the submission pages set no version rule.
- Approving this plan approves the two Pending migration lines as one bundle, worded as below. The user approves the final wording at review.

**Evidence** (`git grep` and reads, 2026-10-29):
- **R1.** `docs/references/style-system/image-display-contract.md` ("Current callers") says `position` is used by `brand-statement`, `newsletter-banner` and `routine-showcase`. Only `sections/newsletter-banner.liquid` passes `position:` to `render 'image'`.
- **R2.** `docs/references/architecture/abstraction-boundaries.md` keeps the paragraph "The shared carousel indicator is an exception to that third-consumer threshold …". The indicator was dropped (user, 2026-10-28; `docs/agent/backlog.md` After submission), and no indicator file exists.
- **R3.** `docs/project.md` Status, Harness bullet, says "`test:layout` (baseline 40)". The baseline holds 9 entries. The RR1 roadmap item still lists RR1-C and RR1-D as next.
- **Deferred ideas.** The board has five entries. `docs/project.md` roadmap item 8, "Not planned", already names four of them (the `AGENTS.md` pass, looping media video, home scroll narrative, Lighthouse CI theme cleanup) and the 62.5% root size, which covers the fifth.
- **Pending migration.**
  - Line 1, "The board holds only choices the user can make now", has the recorded target `AGENTS.md` Batch SOP step 7.
  - Line 2, "Generated CSS checked before every commit", has the recorded targets Batch SOP step 9 and the Validation table.

**Implementation surface.**
- `docs/references/style-system/image-display-contract.md`: the "Current callers" `position` sentence.
- `docs/references/architecture/abstraction-boundaries.md`: the carousel indicator paragraph.
- `docs/project.md`: the Status Harness bullet, and roadmap item 5 (RR1).
- `AGENTS.md`: the two migrated rules only.
- `docs/agent/board.md`: the Pending migration and Deferred ideas sections.

**Method.**
1. **R1.** Name only `sections/newsletter-banner.liquid` as the `position` caller. Keep the `placeholder_style` sentence as it is.
2. **R2.** Delete the indicator paragraph. Do not add a replacement rule; the third-consumer threshold in the table above it stands.
3. **R3.** Change the Harness bullet to "baseline 9". Bring roadmap item 5 up to date: RR1-C was the audit with no launch blocker; RR1-E fixed its two defects (`061a180`); next is RR1-D1 and then RR1-D2.
4. **Line 1 migration.** Place it where `AGENTS.md` defines what the board holds: the Record-layer checks bullet that starts "`docs/project.md` holds identity …". That is the board's content definition. Step 7 is about reviews, so the recorded target is corrected; say so in the log. Wording: "The board holds only choices the user can make now; design choices wait in the polish sections of `backlog.md`."
5. **Line 2 migration.** Add one clause to step 9: before a commit that changes `tailwind/` or a Tailwind content source (`layout/`, `sections/`, `snippets/`, `blocks/`, `templates/`, `config/`, `assets/*.js`), run `npm.cmd run build:tw` and confirm `git diff -- assets/tailwind.output.css` leaves nothing unstaged. A running `watch:tw` does not count. No Git hook. In the Validation table, add the same check to the `tailwind/**` row, or point to step 9, whichever adds fewer words.
6. **Board.** Empty Pending migration and Deferred ideas; each section keeps its heading with "None." Add one closing line naming the commit.
7. Keep `AGENTS.md` under 200 lines (now 173). It is the official target the board's Deferred ideas cite.

**Review tier:** Ask. The batch changes the agent rules (`AGENTS.md`, `docs/references/`, `docs/project.md`).

**Estimate:** about 45 minutes, plus one Ask review.

**Checkpoint:** one stop, after the validators pass. Report the full diff of `AGENTS.md`, so the user can approve the rule wording.

**Bar:** must-fix and residue as follows.

- Must-fix: every cited path and symbol resolves; no rule is added, strengthened or weakened beyond the two approved lines; `AGENTS.md` stays under 200 lines; the board has no topics, migrations or deferred ideas.
- Accepted residue: none.
- Judged on the files as committed.

**Acceptance checks.**
1. `git grep -n "position" -- docs/references/style-system/image-display-contract.md` shows `newsletter-banner` as the only named caller.
2. `git grep -n -i "carousel indicator" -- docs/references` returns nothing.
3. `git grep -n "baseline 40" -- docs/project.md` returns nothing.
4. `git diff -- AGENTS.md` adds only the two rules (reviewer reads it against the board's Pending migration text at `HEAD`).
5. `wc -l AGENTS.md` < 200.
6. `npm.cmd run lint:doc-paths`, `npm.cmd run doctor:agent` and `npm.cmd run lint:records` pass; `npx prettier --check` passes on the changed files.
