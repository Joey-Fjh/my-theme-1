# Asset size baseline

All sizes measured at commit `926dddb` from files under `assets/`.

## Reproducible command

```powershell
node --input-type=module -e "
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = 'd:/fjh/shopify/my-theme-1/assets';
for (const name of fs.readdirSync(root).filter(f => f.endsWith('.js') || f.endsWith('.css')).sort()) {
  const buf = fs.readFileSync(path.join(root, name));
  const gzip = zlib.gzipSync(buf);
  console.log([name, buf.length, gzip.length].join('\t'));
}
"
```

## Per-file sizes

| File | Raw bytes | Gzip bytes |
|------|-----------|------------|
| alpine.components.filters.js | 36,429 | 6,526 |
| alpine.components.header.js | 3,798 | 960 |
| alpine.components.js | 5,375 | 1,739 |
| alpine.components.overlays.js | 39,528 | 6,763 |
| alpine.components.pagination.js | 8,279 | 2,029 |
| alpine.components.product-cards.js | 20,803 | 3,473 |
| alpine.components.product-media.js | 44,389 | 7,445 |
| alpine.components.product.js | 80,381 | 12,532 |
| alpine.components.registry.js | 482 | 223 |
| alpine.components.search.js | 16,504 | 3,125 |
| alpine.components.ui.js | 109,075 | 15,971 |
| alpine.store.cart.js | 10,559 | 2,167 |
| alpine.store.dialog.js | 11,171 | 2,411 |
| alpine.store.js | 386 | 199 |
| alpine.store.registry.js | 324 | 191 |
| alpine.store.toast.js | 1,859 | 676 |
| base.css | 4,211 | 1,094 |
| base.js | 20,323 | 4,380 |
| dialog-motion.js | 10,837 | 2,308 |
| drawer-motion.js | 8,711 | 1,891 |
| events.js | 3,543 | 925 |
| gift-card.css | 5,761 | 1,189 |
| gift-card.js | 1,101 | 446 |
| https.js | 12,178 | 2,905 |
| performance.js | 1,546 | 527 |
| quantity-constraints.js | 7,778 | 1,862 |
| tailwind.output.css | 368,793 | 41,205 |
| utils.js | 2,955 | 771 |
| vendor-alpine-intersect.min.js | 898 | 560 |
| vendor-alpine.min.js | 45,769 | 16,488 |
| vendor-swiper.min.css | 14,436 | 2,943 |
| vendor-swiper.min.js | 155,191 | 43,655 |

## Subtotals

| Group | Files | Raw bytes | Gzip bytes |
|-------|-------|-----------|------------|
| **Vendor** | `vendor-*.js`, `vendor-swiper.min.css` | 216,294 | 63,646 |
| **Runtime / theme JS** (non-vendor) | All other `.js` | 457,213 | 81,999 |
| **CSS (excl. Tailwind output)** | `base.css`, `gift-card.css`, `vendor-swiper.min.css` | 24,408 | 5,226 |
| **tailwind.output.css** (includes Swiper CSS via `@import` in `tailwind/tailwind.input.css:81`) | 1 file | 368,793 | 41,205 |

## Global layout load (all pages using `layout/theme.liquid`)

Scripts and CSS referenced in `layout/theme.liquid:21–64` (every storefront page except password/gift card layouts).

| Metric | Raw bytes | Gzip bytes |
|--------|-----------|------------|
| Listed `defer` JS files (27 assets) | 659,071 | 142,702 |
| `tailwind.output.css` | 368,793 | 41,205 |
| **Total (theme-owned, excl. `content_for_header`)** | 1,027,864 | 183,907 |

Password layout (`layout/password.liquid:17–17`) loads **only** `tailwind.output.css` (368,793 raw / 41,205 gzip) plus Shopify `content_for_header`.

Gift card template (`templates/gift_card.liquid`) uses separate `gift-card.css` / `gift-card.js` (not in global layout table above).
