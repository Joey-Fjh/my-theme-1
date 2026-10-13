# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-13.

## 6-V7 external skills and tool triggers

**Status:** direction accepted by the user 2026-10-13 ("可以"). Authorized 2026-10-13 ("直接做吧"), executed by the coordinator in this session. Executed; waiting on independent review (Ask).

**Outcome:** every review and documentation tool the polish pass will use has a named trigger, so it is used when its work comes up, not only installed.

- Emil Kowalski's `review-animations` is vendored unmodified and runs on motion changes before review.
- `frontend-design`, the four GSAP skills and Chrome DevTools MCP get named triggers. Shopify Dev MCP and Context7 were reviewed: their triggers in `AGENTS.md` Sources already hold, so they do not change.
- `impeccable` is **not vendored** (user, 2026-10-13). The coordinator check of upstream `pbakaus/impeccable` (4.5.2, Apache 2.0) found four problems:
  - its description triggers on almost any frontend task;
  - it ships generation commands (`bolder`, `overdrive`, `delight`, `live`, `generate`);
  - its launcher downloads a native binary on first run, and it offers an edit hook and writes `PRODUCT.md`, a `DESIGN.md` sidecar and critique snapshots;
  - its payload is about 2.2MB.

  Its `critique` (the design-specificity verdict) answers the Theme Store rejection, so it runs once at the start of the polish pass in a separate session (filed on `docs/agent/board.md`). It is not part of this batch.

**Review tier:** Ask (agent rules: `AGENTS.md`, `.agents/`).

**Dependencies:** none.

### Upstream facts (checked 2026-10-13)

- Repository `https://github.com/emilkowalski/skills`, MIT (`LICENSE`, "Copyright (c) 2026 Emil Kowalski"). Pinned revision `2d228630ba1446365f614a108cb8252f1feda202` (2026-10-11).
- Path `skills/review-animations/`: `SKILL.md` (8407 bytes) and `STANDARDS.md` (9801 bytes). No scripts, no data.
- `SKILL.md` sets `disable-model-invocation: true`, so clients do not invoke it on their own and an agent cannot call it as a skill. Triggers therefore read its files by path.

### Implementation surface

- **New `.agents/skills/review-animations/`**, exactly four files:
  - `SKILL.md`, `STANDARDS.md` and `LICENSE`: byte-identical copies from the pinned revision (`LICENSE` from the repository root).
  - `UPSTREAM.md`: the same table shape as `.agents/skills/frontend-design/UPSTREAM.md`, plus a **Project boundary** section:
    - it is a review aid only and ranks below Shopify's official sources, `AGENTS.md` and the project references;
    - where its standards differ from the project, the project wins without discussion. Examples: ownership and tooling per `docs/references/architecture/motion-architecture.md` (no `x-transition`, GSAP only for classified choreography), and hover gating through the project's `can-hover` variant;
    - its findings are reported, not applied, outside the batch surface.
- **`.agents/skills/frontend-design/UPSTREAM.md`**, Project boundary only: replace "It is not read by default" with the trigger below. The vendored `SKILL.md` and `LICENSE.txt` are untouched.
- **`AGENTS.md` Agent Skills**, rewritten paragraph:
  - **`review-animations`:** a batch that adds or changes motion (CSS `transition`, `animation` or `@keyframes`, motion tokens, reduced-motion handling, Alpine-driven visibility transitions, GSAP) reads its `SKILL.md` and `STANDARDS.md` and reviews the motion diff before step 7. Findings and the Block or Approve verdict go into `context.md`. The motion reference wins on conflict.
  - **GSAP skills:** read when work touches a GSAP consumer (`assets/motion-gsap.js`, `assets/scatter-gallery.js`) or after the motion reference classifies new work as complex choreography. Read `gsap-core` always, plus `gsap-scrolltrigger`, `gsap-timeline` or `gsap-performance` as the change needs.
  - **`frontend-design`:** read at the start of a design or polish batch whose plan changes visual direction (typography, layout composition, colour composition). Suggestions are still discussed with the user before adoption.
- **`AGENTS.md` Sources**, one new bullet: use Chrome DevTools MCP against `shopify theme dev` when a claim depends on rendered or runtime behaviour, for example:
  - console errors, network requests, focus and keyboard behaviour after a JS or interaction change;
  - screenshots at 390 and 1440 for visual batches;
  - performance traces for Lighthouse ownership classification.

  The rule "Verify rendered output when a claim depends on platform behavior" stays where it is.
- **`.agents/roles/implementer.md` Working method**, one bullet: before handing a batch over for review, run each tool that `AGENTS.md` Agent Skills triggers for the batch's surface, and record its output in `context.md`.
- **`.agents/roles/verifier.md` Reviewer checklist**, one bullet: confirm every tool that `AGENTS.md` Agent Skills triggers for the batch's surface ran and that its output is recorded. A missing run is a finding.
- **Record files:** this file, `docs/agent/board.md` and `docs/project.md` (status line at close).

**Forbidden:**
- theme files (`layout/`, `sections/`, `snippets/`, `blocks/`, `templates/`, `config/`, `locales/`, `assets/`, `tailwind/`);
- any `impeccable` file in the repository;
- edits to vendored `SKILL.md`, `STANDARDS.md`, `LICENSE` or `LICENSE.txt` files;
- client adapters (`.claude/`, `.cursor/`, `.codex/`), `package.json`, `.github/workflows/ci.yml`, `README.md`;
- `prettier --write`.

### Acceptance checks

1. `git ls-files -o --exclude-standard .agents/skills/review-animations` (before staging) lists exactly `SKILL.md`, `STANDARDS.md`, `LICENSE` and `UPSTREAM.md`.
2. Each of `SKILL.md`, `STANDARDS.md` and `LICENSE` matches upstream at `2d228630`. `git hash-object <file>` equals the blob SHA from `gh api "repos/emilkowalski/skills/git/trees/2d228630ba1446365f614a108cb8252f1feda202?recursive=1"` for `skills/review-animations/SKILL.md`, `skills/review-animations/STANDARDS.md` and `LICENSE`. Line endings stay as in upstream; check `.gitattributes` does not rewrite them.
3. `UPSTREAM.md` records the repository, the pinned revision, the upstream paths, the retrieval date and the licence, and has the Project boundary section described above.
4. `git grep -n "review-animations" AGENTS.md .agents/roles` shows the trigger in `AGENTS.md`, `implementer.md` and `verifier.md`. `git grep -n -i "chrome devtools" AGENTS.md` shows the Sources bullet. `git grep -n "not read by default" AGENTS.md .agents/skills/frontend-design/UPSTREAM.md` returns nothing.
5. `git ls-files | grep -i impeccable` and `git ls-files -o --exclude-standard | grep -i impeccable` return nothing.
6. `npm.cmd run lint:doc-paths` and `npm.cmd run doctor:agent` pass. Every relative Markdown link in the changed files resolves; list the links and the check used.
7. `git diff --stat HEAD` plus the untracked list show only the implementation surface.
8. Independent review (Ask) reports PASS.

## 6-V7: executed

Executed 2026-10-13 by the coordinator. Not accepted. Review tier stays Ask.

**Material correction to check 4:** the role bullets name the trigger source generically ("each tool that `AGENTS.md` Agent Skills triggers"), as the surface section specifies, so `review-animations` does not appear in `.agents/roles`. Check 4 is run as: `git grep -n "review-animations" AGENTS.md` plus `git grep -n "Agent Skills triggers" .agents/roles`.

### Validation (2026-10-13)

1. `git ls-files -o --exclude-standard .agents/skills/review-animations` lists `LICENSE`, `SKILL.md`, `STANDARDS.md` and `UPSTREAM.md`.
2. `git hash-object` equals the upstream tree blob SHA at `2d228630` for all three copies:
   - `SKILL.md` `577a6439`
   - `STANDARDS.md` `863ea12e`
   - `LICENSE` `57b46f1f`

   `.gitattributes` is `* text=auto eol=lf`, and the upstream files are LF, so the copies are not rewritten.
3. `UPSTREAM.md` holds the provenance table and the Project boundary section. The boundary covers motion ownership, reduced motion, `can-hover`, and no Framer Motion or spring advice.
4. As corrected above:
   - `AGENTS.md` lines 133 and 139 name `review-animations`.
   - `AGENTS.md` line 108 is the Chrome DevTools bullet.
   - `implementer.md` line 23 and `verifier.md` line 29 hold the trigger bullets.
   - `git grep -n "not read by default" AGENTS.md .agents/skills/frontend-design/UPSTREAM.md` returns nothing (exit 1).
5. `git ls-files | grep -i impeccable` and the same over untracked files return nothing (exit 1).
6. `lint:doc-paths` passed, and `doctor:agent` exits 0.
   - **Links, corrected after review round 1:** the first scan skipped the vendored `SKILL.md`. It has three relative links, `[STANDARDS.md](STANDARDS.md)` on lines 25, 37 and 115 (`grep -n '](STANDARDS.md)'`), and all three resolve to the vendored `STANDARDS.md`. The other changed files have none.
   - **Formatting, corrected after review round 1:** the earlier "prettier passed" claim proved nothing. `.prettierignore` excludes `.agents`, `docs` and `AGENTS.md`, and `npx prettier --file-info` reports `"ignored": true` for every changed file. Prettier is therefore not a validator for this surface; the vendored files stay byte-identical and are not formatted. `git diff --check HEAD` is the whitespace check used instead.
7. `git diff --stat HEAD` shows these six files:
   - `.agents/roles/implementer.md`
   - `.agents/roles/verifier.md`
   - `.agents/skills/frontend-design/UPSTREAM.md`
   - `AGENTS.md`
   - `docs/agent/board.md`
   - `docs/agent/context.md`

   The only untracked files are the four under `.agents/skills/review-animations/`. All of it is inside the surface.
8. Independent review:
   - **Round 1 (2026-10-13): FAIL** on record defects only. Implementation, provenance and scope were all proven.
     - The link and Prettier claims in check 6 were wrong; corrected above.
     - `docs/agent/board.md` said "no false positives left" while 4 entries were still unconfirmed; it is now qualified as 38 debt and 4 unconfirmed.
   - **Round 2 (2026-10-13): PASS**, no findings. Every acceptance check and both round 1 corrections were re-proven with fresh evidence: `git diff --stat HEAD` reports 6 files, 137 insertions and 21 deletions, plus 4 untracked files. Its one unproven item is the four tab-panel layout entries, which are deferred on the board and do not block this batch.

**Batch complete** (Ask review PASS). No browser pass is required. Next: commit when the user asks, then clear this file.
