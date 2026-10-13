# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-13.

## 6-X1 cut the mother-template relationship from this repository

**Status:** approved by the user on 2026-10-13 ("批准，先处理，不着急提交") after the list was shown in chat, including the edits to `AGENTS.md`, `docs/project.md`, the references and `.agents/`. Executed by the coordinator. Not committed, by the user's instruction. Waiting for the user's look.

**Outcome:** from this repository's side there is no relationship with the mother template any more: no record, wording, comment, remote or temporary file refers to it. No behaviour changes.

**Review tier:** Show, as proposed to the user with the list (wording only; no rule added, strengthened or weakened). The triggers would give Ask (agent rules, `assets/*.js` comments); the user's approval of the proposal sets the tier.

**What changed:**

- **`docs/project.md`:** Identity no longer names a mother template. "Migration Direction (accepted)" with its phase history is replaced by "Accepted Direction", which keeps the constraints still in force (capabilities under the framework contracts, merchant configuration IDs, the Alpine + Tailwind component model, modules enter the import map with their first consumer, consolidated browser verification). "Deviations From The Skeleton" is replaced by "Composition And Local Setup", stated as facts about this theme. The earlier text is `git show 9d366d5:docs/project.md`.
- **`AGENTS.md`:** the routing line names the new section and says "Theme Blocks"; the opening sentence no longer says "shared by every theme built from this codebase".
- **References:** `css-architecture.md` (a table heading and its column, the typography interface sentence), `javascript-runtime.md` (one sentence), `browser-compatibility.md` (one sentence), `motion-architecture.md` (two phrases that spoke of a derived theme).
- **`.agents/`:** the same sentence in the four GSAP `UPSTREAM.md` files; one word in the hook message of `doctor-agent.mjs`.
- **`docs/design/design.md`:** one phrase. **`README.md`:** two phrases. **`docs/agent/board.md`:** every mention.
- **Comments only:** six migration markers removed from `tailwind/tailwind.components.css`, `tailwind/tailwind.input.css`, `tailwind/tailwind.utilities.css` and `assets/gift-card.css`; one comment reworded in `tailwind/tailwind.input.css`; "Skeleton-owned" becomes "theme-owned" in `assets/cart.contract.js` and `assets/alpine.store.cart.js`.
- **Outside Git:** the local remote `skeleton` removed (`git remote -v` shows `origin` only); this session's temporary directories and scripts deleted.

**Kept on purpose:** `LICENSE.md` and the README licence line (Shopify's Skeleton Theme, the legal attribution); the Shopify CSS property `--shopify-accelerated-checkout-skeleton-background-color` and its comments; "skeleton" as a word for loading placeholders in two documents; the branch name `refactor/skeleton-shell`; Git history.

**Validation (2026-10-13):**

| Command | Result |
| --- | --- |
| `git grep -n -i "skeleton" -- . ':!package-lock.json'` | only the kept items above |
| `git grep -n -i "mother template\|my-skeleton\|derived theme"` | no match |
| `npm.cmd run build:tw`, then `git status --short` | `assets/tailwind.output.css` unchanged |
| `npm.cmd run lint:theme`, `lint:compat`, `lint:liquid-syntax`, `lint:doc-paths`, `doctor:agent`, `test:validators` | exit 0 each |
| `npx prettier --check` on the changed files Prettier covers | formatted |
| `git diff --check` | clean |
