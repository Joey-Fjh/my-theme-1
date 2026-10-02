# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-02.

## Plan: vendor the frontend-design skill as a reference (batch 5-K)

Status: implemented (uncommitted); review pending. Review tier: **Ask** (changes `AGENTS.md`, an agent-rule file); the user chose the GPT review (2026-10-02, "审查").

**User approval (2026-10-02).** Explicit request to add a frontend design skill (`CLAUDE.md`: skill changes only when the user asks): "引入可以，只不过和gsap一样，在skills中，但不一定就无脑调用 … 权重没有官方的mcp和最佳实践高，只是一个参考建议，可以查看讨论，再说采不采纳"; no conflict table ("冲突的话，感觉这没有必要"). The `AGENTS.md` sentence and the `UPSTREAM.md` boundary record exactly that weighting.

**Implementation surface.** `.agents/skills/frontend-design/` (new: `SKILL.md`, `LICENSE.txt` copied unchanged from upstream; `UPSTREAM.md` written here), `AGENTS.md` (Agent Skills: one added sentence), record files.

**Acceptance checks.**

- K1 `SKILL.md` and `LICENSE.txt` are byte-identical to `https://github.com/anthropics/skills` at `8a1541c4a3ffa5a20a5a91de0dcf3f0bab1d1ef4`, path `skills/frontend-design/`; the license is Apache 2.0 and its terms are met (license kept with the copy; no NOTICE file upstream).
- K2 `UPSTREAM.md` follows the GSAP skills' `UPSTREAM.md` structure (provenance table, project boundary) and states the user's weighting: reference only, below Shopify's official sources, best practices, and project rules; not read by default; suggestions discussed before adoption.
- K3 `AGENTS.md`: only the Agent Skills paragraph changes, by one sentence; no other rule added, removed, or reworded.
- K4 The skill is reachable through the adapters without copies: `.claude/skills` resolves to `.agents/skills` (symlink); no files under `.cursor/skills/` or other adapter paths.
- K5 `npm.cmd run lint:doc-paths`, `npm.cmd run doctor:agent`, Prettier on `AGENTS.md`, `.agents/skills/frontend-design/UPSTREAM.md`, `docs/agent/board.md`, `docs/agent/context.md`: pass.

**Progress.** Implemented; K5 run by the coordinator: `lint:doc-paths` pass, `doctor:agent` exit 0, Prettier pass.

### Review round 1 (GPT, 2026-10-02): FAIL on K1, and fix

- Finding: `SKILL.md` and `LICENSE.txt` had CRLF line endings, so their bytes differed from upstream (LF); identical after normalization. Cause: the coordinator's temporary upstream clone ran with `core.autocrlf=true`. K2–K5 passed.
- Fix: both files converted to LF. SHA-256 now equals the reviewer's upstream hashes: `SKILL.md` `d91970639e9f5c37682ac7ab60094d35f1c7c1f38d731bd56396563aee10c1d3`, `LICENSE.txt` `0d542e0c8804e39aa7f37eb00da5a762149dc682d7829451287e11b938e94594`. (The repository's `.gitattributes` `* text=auto eol=lf` would have stored LF on commit regardless.)

### Review round 2 (GPT, 2026-10-02): PASS
