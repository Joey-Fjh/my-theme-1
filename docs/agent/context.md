# Agent Context

This is a user-maintained working notebook. Agents read it on demand when the user asks to continue previous work, review outstanding tasks, or prepare next-session context. Updates are manual; agents do not auto-update this file.

- `Next Topics`: actionable items tracked across sessions. Mark done items as done or remove them; add new items as they arise.
- `Next Session Template`: fill in before ending a session if the user asks for next-session context.

## Next Topics

- Review root entry points and confirm only agent entry adapters remain at the repository root.
- Review `agent-router` and the routing docs after real usage; then decide whether repeated docs references should become skills.
- Smoke-test tool adapter symlink resolution and confirm Claude reads `CLAUDE.md` and `.claude/skills`.
- Confirm CI runs `npm run lint` in GitHub after the branch is pushed.
- Plan MCP configuration for Shopify Dev MCP, Playwright MCP, Figma MCP, and Chrome DevTools MCP in a separate pass under tool-owned config directories.
- Decide whether to add optional skill UI metadata later; do not do it unless it clearly helps discovery.
- Global settings: validate all new settings render correctly in theme editor (dev server).
- Global settings: tune default values after visual review (badge radius, cart type, etc.) — current defaults are close to Dawn, may need differentiation.
- Global settings: Contact form exact-script runtime fixture passed for toast mode and plain error text; a real storefront submit remains an optional integration smoke test after a contact page is added.
- Global settings: password page remains intentionally excluded until its standalone layout/runtime is redesigned.
- Global settings: Toast `ring-1 ring-black/5` should eventually move to a token too (not urgent).
- Global settings: root section padding is a fallback; existing section-owned padding settings intentionally override it to preserve storefront behavior.
- Global settings: runtime audit verified Cart drawer/page routing, Search enabled/disabled behavior, Product Card ratio/tokens, narrative reveal fallback, Contact toast errors, soft borders, Dialog overlay, and Focus ring tokens.

## Next Session Template

Fill in before ending a session if the user asks for next-session context. Each field:

- Current state: Global settings 的定义、token 桥接和 storefront 消费链路已完成。Cart drawer/page 行为由全局设置统一控制；全局 cart color scheme 优先并保留 section fallback；Search、Product Cards、Badges、Forms（contact）、Animations 已接入。Password 页面按用户决定排除。叙事性 reveal 可全局关闭，功能性状态动画不受影响，reduced-motion 优先。
- Objective: 完成全局设置定义、token 基础设施和对应 storefront 行为消费，并保持原有功能。
- Files changed: config/settings_schema.json, snippets/css-variables.liquid, tailwind sources/output, cart/search/product card/badge/contact/motion related Liquid and JS, locales, motion architecture reference.
- User decisions: Cards 统一一套（不拆 product/collection/blog）；Drawers/Popups 继承 Panels 基础 + Toast/Dialog 独立覆盖；Product Cards 独立 token；命名 Panels（不叫 Containers）；Cart 支持 drawer + page 两种模式；Forms 支持 inline + toast 两种错误显示；Badges 用 color_scheme 类型（不单独分散色值）。
- Checks run: npm run lint ✅, npm test ✅, Shopify MCP validate_theme ✅, npm run build:tw ✅, git diff --check ✅, Shopify theme dev upload ✅, Playwright runtime smoke test ✅ for Cart drawer/page routing, Product Card token/ratio consumption, Search enabled/disabled behavior, and narrative reveal disabled fallback.
- Known blockers: Dev store currently has no `/pages/contact`, so Contact inline/toast submission could not be browser-tested. Default values may still need visual review to distinguish the theme from Dawn. Password page intentionally does not consume Forms global settings.
- Next recommended prompt: Add or select a contact page in the dev store and smoke-test inline/toast form errors; then visually tune global defaults in the theme editor.
