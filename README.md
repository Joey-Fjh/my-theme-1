# My Skeleton Theme

This Shopify theme is based on the [Skeleton](http://getskeleton.com/) framework.

Primary project rules and implementation guidance live in [AGENTS.md](AGENTS.md).

---

## Third-Party Libraries

| Library       | Version | File(s)                                         | CDN / Source                                                                                                                           |
| ------------- | ------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Alpine.js     | v3.15.3 | `vendor-alpine.min.js`                          | [jsDelivr](https://cdn.jsdelivr.net/npm/alpinejs@3.15.3/dist/cdn.min.js)                                                               |
| Intersect.js  | v3.x.x  | `vendor-alpine-intersect.min.js`                | [jsDelivr](https://cdn.jsdelivr.net/npm/@alpinejs/intersect@3.x.x/dist/cdn.min.js)                                                     |
| Swiper        | v12.0.3 | `vendor-swiper.min.js`, `vendor-swiper.min.css` | [CSS](https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css), [JS](https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js) |
| GSAP          | v3.14.1 | `vendor-gsap.min.js`                            | [jsDelivr](https://cdn.jsdelivr.net/npm/gsap@3.14.1/dist/gsap.min.js)                                                                  |
| ScrollTrigger | v3.14.1 | `vendor-gsap-scrolltrigger.min.js`              | [jsDelivr](https://cdn.jsdelivr.net/npm/gsap@3.14.1/dist/ScrollTrigger.min.js)                                                         |

> Always update this table when replacing or upgrading a library.

---

## Build Commands

```bash
npm run dev        # shopify theme dev + tailwind watch
npm run build:tw   # production CSS build
npm run watch:tw   # CSS watch mode
npm run build:svg  # optimize SVG icons (icons/ -> assets/)
npm test           # shopify theme check
```

---

## Documentation

| Document                                                           | Purpose                                                 |
| ------------------------------------------------------------------ | ------------------------------------------------------- |
| [AGENTS.md](AGENTS.md)                                             | Canonical repository rules and architecture constraints |
| [skills/code-review/pre-merge.md](skills/code-review/pre-merge.md) | Review checklist aligned to `AGENTS.md`                 |
