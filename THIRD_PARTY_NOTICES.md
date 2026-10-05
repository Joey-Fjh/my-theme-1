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
