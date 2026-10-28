# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-28.

## Fix MR1: cascade rows partly hidden on first load

**Status:** implemented by the coordinator (user: "直接修", 2026-10-28); Ask review pending.

**Defect (user screenshot, collection page).** On first load, part of a visible product row stayed hidden: the bottom-right cards were missing. A scroll down and back up showed them.

**Cause.** In `assets/motion-reveal.js`, `_scheduleDelayedReveal` re-checked every cascade target against the inset viewport (top above 85% of the viewport height) at its own delay. It tested the target's pending box, which is offset about 70px down and scaled 0.97. A target failing that check was dropped with no retry until the next scroll check. So one row could split: some cards revealed, the rest pending.

**Reproduction** (Chrome DevTools MCP, `/collections/女士衣服`, 1994×1350, first load at the top):
- Row 2: 3 cards `revealed`, 1 card `pending` with 177px visible.
- A 1px scroll did not reveal it.

**Fix.** A cascade row is admitted once by its trigger (`_registerCascadeBatch` and the flush paths keep their checks). `_scheduleDelayedReveal` skips the per-target viewport check when it runs for a cascade batch. It is the only caller of `_scheduleDelayedReveal` (`grep -n "_scheduleDelayedReveal(" assets/motion-reveal.js`).

**Reach.** Every `data-motion-cascade` container:
- the sections `blog-stories`, `blog`, `collection`, `collections`, `editorial-collage`, `featured-products`, `formula-details`, `icon-with-text`, `philosophy-section`, `scroll-categories`;
- the snippets `product-recommendations-section`, `search-results-tabs` and `section-frame`;
- including rows appended by pagination.

**After the fix:** same page and viewport, the 8 visible cards are `revealed` (row 1 542px visible, row 2 248px); only the off-screen card is `pending`.

**Unchanged.** A row whose trigger has not crossed the line stays pending as a whole until it does (the existing design); single, non-cascade reveals keep their checks.

**Validators:** `lint:compat` pass, `lint:theme` pass, Prettier on `assets/motion-reveal.js` pass.

**review-animations** (`.agents/skills/review-animations/SKILL.md` and `STANDARDS.md`, read 2026-10-28):

| Before | After | Why |
| --- | --- | --- |
| A cascade row admitted by its trigger could reveal only some targets; the rest waited, hidden, for a scroll | The whole admitted row reveals in stagger order | Standard 1, justified motion: a reveal that leaves visible content missing explains nothing and reads as a loading fault. The fix only changes which targets run. |

- No duration, easing, animated property, origin or stagger value changed (standards 3 to 5 and 7 untouched).
- Reduced motion is unchanged (standard 8): targets still appear with no transform.
- Verdict: approve.

**Review tier.** Ask (`assets/*.js`).

**Review 1 (Verifier, 2026-10-28): FAIL on the record only.**
- Proven, MR1: at 1994×1350 all 8 visible cards revealed on first load; HEAD's per-target recheck at the 1147.5px inset rejected the last row-2 target at about 1159px.
- Proven, safety: one caller; a row below the inset stays wholly pending; targets hidden or clip-hidden during their delay stay pending; stagger is about 167ms; reduced motion and editor replay hold.
- Proven, other cascades: no split rows on home featured products, recommendations, search and blog at 390 and 1440.
- Proven, `collection-list`: equal to `b11173a~1`, 26 mappings with 0 mismatches.
- Validators pass; `test:layout` reports 0 new issues.
- Defect, P2: the `review-animations` output was missing. It is recorded above (coordinator correction, 2026-10-28).
