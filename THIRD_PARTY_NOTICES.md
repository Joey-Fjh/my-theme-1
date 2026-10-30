# Third-Party Notices

This theme includes third-party software. Each component below is distributed under its own license, reproduced unchanged from its upstream source.

## Alpine.js

- Version: 3.15.3
- File: `assets/vendor-alpine.min.js`, byte-identical to `dist/cdn.min.js` of the `alpinejs@3.15.3` npm package (checked 2026-09-22). The upstream minified build carries no license header, so the notice is kept here.
- Source: https://github.com/alpinejs/alpine
- License text: https://github.com/alpinejs/alpine/blob/v3.15.3/LICENSE.md

```text
MIT License

Copyright © 2019-2025 Caleb Porzio and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Alpine.js Intersect plugin

- Version: 3.15.3 (same release line as `alpinejs@3.15.3` above; `@alpinejs/intersect@3.15.3` on npm)
- File: `assets/vendor-alpine-intersect.min.js` — minified Intersection Observer plugin for Alpine (`dist/cdn.min.js` of `@alpinejs/intersect@3.15.3`). The bundle carries no license header (same pattern as `vendor-alpine.min.js`).
- Source: https://github.com/alpinejs/alpine/tree/v3.15.3/packages/intersect
- License text: https://github.com/alpinejs/alpine/blob/v3.15.3/LICENSE.md (MIT; same as Alpine.js core)

```text
MIT License

Copyright © 2019-2025 Caleb Porzio and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Phosphor Icons

- Version: `@phosphor-icons/core@2.1.1` (UI icons, 2026-10-25); earlier content icons vendored from the same upstream without a pinned version in Git.
- Files (UI, regular weight, optimized via `npm.cmd run build:svg` from staged sources in `icons/` on 2026-10-25): `assets/icon-3d-model.svg`, `assets/icon-account.svg`, `assets/icon-arrow.svg`, `assets/icon-arrow1.svg`, `assets/icon-arrow2.svg`, `assets/icon-cart.svg`, `assets/icon-check.svg`, `assets/icon-check-circle.svg`, `assets/icon-chevron-down.svg`, `assets/icon-chevron-left.svg`, `assets/icon-chevron-right.svg`, `assets/icon-chevron-up.svg`, `assets/icon-close.svg`, `assets/icon-eye.svg`, `assets/icon-facebook.svg`, `assets/icon-filter.svg`, `assets/icon-info-circle.svg`, `assets/icon-instagram.svg`, `assets/icon-menu.svg`, `assets/icon-minus.svg`, `assets/icon-mute.svg`, `assets/icon-pinterest.svg`, `assets/icon-play.svg`, `assets/icon-plus.svg`, `assets/icon-search.svg`, `assets/icon-snapchat.svg`, `assets/icon-sortby.svg`, `assets/icon-sparkle.svg`, `assets/icon-star.svg`, `assets/icon-tiktok.svg`, `assets/icon-trash.svg`, `assets/icon-tumblr.svg`, `assets/icon-twitter.svg`, `assets/icon-unmute.svg`, `assets/icon-x-circle.svg`, `assets/icon-youtube.svg`
- Files (content blocks, regular weight): `assets/icon-content-*.svg` (24 icons; added between 2026-08-05 and 2026-10-16 per Git history; notice added 2026-10-11; `icon-content-flask.svg` added and `icon-content-recycle.svg` replaced with the upstream glyph on 2026-10-16 from `assets/regular/`, single-file svgo runs with `svgo.config.cjs`)
- Source: https://github.com/phosphor-icons/core
- License text: https://github.com/phosphor-icons/core/blob/main/LICENSE (MIT)

```text
MIT License

Copyright (c) 2023 Phosphor Icons

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Simple Icons

- Version: `simple-icons@16.35.0`
- Files: `assets/icon-vimeo.svg` (Vimeo logo; optimized via `npm.cmd run build:svg` from staged source in `icons/` on 2026-10-25). Phosphor Icons does not ship a Vimeo mark.
- Source: https://github.com/simple-icons/simple-icons (`icons/vimeo.svg`)
- License: CC0-1.0 — https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md

```text
Simple Icons are released under the Creative Commons CC0 1.0 Universal (public domain).
See the Simple Icons LICENSE.md in the npm package for the full CC0 1.0 Universal text.
```

## Swiper

- Version: 12.1.2 (from file headers in the vendored bundles)
- Files: `assets/vendor-swiper.min.js`, `assets/vendor-swiper.min.css`
- Source: https://swiperjs.com / https://github.com/nolimits4web/swiper
- License text: https://github.com/nolimits4web/swiper/blob/v12.1.2/LICENSE (MIT)

```text
MIT License

Copyright (c) 2014-2026 Vladimir Kharlampidi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## GSAP (GreenSock)

- Version: 3.15.0 (from `npm view gsap version` at vendoring time, 2026-10-05)
- Files: `assets/vendor-gsap.min.js`, `assets/vendor-gsap-scrolltrigger.min.js` (unmodified copies of `dist/gsap.min.js` and `dist/ScrollTrigger.min.js` from the npm package)
- MD5 (npm `dist/` files): `BF3FD8EC2A5D9F4531B4C310222361F8` (`gsap.min.js`), `5445D0E95E612449839D2462BA8AB7D0` (`ScrollTrigger.min.js`)
- Source: https://gsap.com / https://www.npmjs.com/package/gsap
- License: GreenSock Standard "No Charge" License (https://gsap.com/community/standard-license/)

```text
See https://gsap.com/community/standard-license/ for the current GreenSock Standard License terms.
Redistribution inside a Shopify theme is a merchant/platform packaging use; written confirmation from GSAP remains optional before Theme Store submission (residual risk accepted in batch 6-S5).
```

When a vendored library is added, replaced, or upgraded, update its entry here in the same change.
