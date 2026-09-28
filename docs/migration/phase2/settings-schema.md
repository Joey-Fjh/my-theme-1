# Phase 2 settings schema comparison

Baseline: HEAD after `1bf75c6`. Skeleton: `5191a50` (`skeleton/main`).

## Summary

| Bucket | Count | Evidence |
| --- | ---: | --- |
| Theme setting IDs | 83 | `node` parse `git show HEAD:config/settings_schema.json` |
| Skeleton setting IDs | 29 | `git show skeleton/main:config/settings_schema.json` |
| Shared IDs | 29 | set intersection |
| Theme-only IDs | 54 | theme minus skeleton |
| Skeleton-only IDs | 0 | skeleton minus theme |
| Shared ID type conflicts | 0 | compare `type` field per shared ID |

Commands:

```powershell
git show HEAD:config/settings_schema.json | node -e "..."
git show skeleton/main:config/settings_schema.json | node -e "..."
```

## Merchant JSON reference scan (G2)

Script: `docs/migration/phase2/scripts/scan-settings-refs.js`

```powershell
node docs/migration/phase2/scripts/scan-settings-refs.js
```

**2026-09-28 output:** `referencedCount` **265** unique global/section setting IDs across `config/settings_data.json` (`current` top-level keys + nested `sections.*.settings`), all `templates/*.json`, and `sections/*-group.json` (18 files).

**Spot checks (must be `true`):**

| ID | Referenced |
| --- | --- |
| `reveal_behavior` | yes |
| `toast_position` | yes |
| `type_header_font` | yes |
| `color_schemes` | yes |

Column **Referenced in merchant JSON** below uses this scan. IDs with `yes` that would be removed or renamed in phase 3+ → **USER DECISION**. IDs with `no` may still be referenced in Liquid (`settings.<id>`); those retain **USER DECISION if removed** when Liquid hits exist.

## Settings chain IDs (skeleton validators)

From `.agents/skills/check-theme-architecture/scripts/lib/theme-contracts.js` (`SETTINGS_CHAIN_LIQUID`, `SETTINGS_CHAIN_CSS_TYPOGRAPHY`, `SETTINGS_CHAIN_CSS_COLOR`) and `docs/references/style-system/css-architecture.md` (typography/color token chain). Mark **chain** when the ID feeds `snippets/css-variables.liquid` or global typography/color utilities.

| ID | In theme schema | In skeleton schema | chain |
| --- | --- | --- | --- |
| `badge_corner_radius` | no | no | yes |
| `badge_position` | no | no | yes |
| `body_font_size` | yes | yes | - |
| `body_font_size_mobile` | yes | yes | - |
| `body_letter_spacing` | yes | yes | - |
| `body_line_height` | yes | yes | - |
| `body_scale` | yes | no | yes |
| `body_text_transform` | yes | yes | - |
| `brand_description` | no | no | yes |
| `brand_headline` | no | no | yes |
| `brand_image` | no | no | yes |
| `brand_image_width` | no | no | yes |
| `card_color_scheme` | no | no | yes |
| `card_image_padding` | no | no | yes |
| `card_style` | no | no | yes |
| `card_text_alignment` | no | no | yes |
| `collection_card_color_scheme` | no | no | yes |
| `collection_card_image_padding` | no | no | yes |
| `collection_card_style` | no | no | yes |
| `collection_card_text_alignment` | no | no | yes |
| `color_scheme` | no | no | yes |
| `color_schemes` | yes | yes | yes |
| `favicon` | yes | yes | - |
| `heading_letter_spacing` | yes | yes | - |
| `heading_line_height` | yes | yes | - |
| `heading_scale` | yes | yes | yes |
| `heading_text_transform` | yes | yes | - |
| `heading_weight` | yes | yes | - |
| `logo` | yes | yes | - |
| `logo_width` | yes | yes | - |
| `page_canvas_color_scheme` | yes | yes | - |
| `page_margin` | yes | yes | - |
| `page_width` | yes | yes | yes |
| `product_card_image_ratio` | yes | yes | - |
| `sale_badge_color_scheme` | no | no | yes |
| `social_facebook_link` | yes | yes | yes |
| `social_instagram_link` | yes | yes | yes |
| `social_pinterest_link` | yes | yes | yes |
| `social_snapchat_link` | yes | yes | yes |
| `social_tiktok_link` | yes | yes | yes |
| `social_tumblr_link` | yes | yes | yes |
| `social_twitter_link` | yes | yes | yes |
| `social_vimeo_link` | yes | yes | yes |
| `social_youtube_link` | yes | yes | yes |
| `sold_out_badge_color_scheme` | no | no | yes |
| `spacing_grid_horizontal` | no | no | yes |
| `spacing_grid_vertical` | no | no | yes |
| `spacing_sections` | no | no | yes |
| `type_body_font` | yes | yes | yes |
| `type_header_font` | yes | yes | yes |

## Per-ID reference scan (theme)

Merchant JSON consulted read-only: `config/settings_data.json`, `templates/*.json`, `sections/*-group.json` (not modified). Liquid: `rg -n 'settings.<id>'` on `layout/`, `sections/`, `snippets/`.

**USER DECISION** — any theme-only ID that merchants reference and phase 3+ would remove or rename must be decided by the user (`docs/project.md:20`).

### Theme-only IDs (54)

| ID | type | Referenced in merchant JSON | Liquid / notes |
| --- | --- | --- | --- |
| `body_scale` | range | no | snippets\css-variables.liquid:109 (**USER DECISION** if removed) |
| `reveal_behavior` | select | **yes** | layout\theme.liquid:82 — **USER DECISION** if removed |
| `toast_position` | select | **yes** | snippets\ui-toast.liquid:2 — **USER DECISION** if removed |
| `motion_enabled` | checkbox | no | layout\theme.liquid:73 — **USER DECISION** if removed |
| `button_border_thickness` | range | no | snippets\css-variables.liquid:148:        --button-border-width: {{ settings.button_border_thickness }}px; (**USER DECISION** if removed) |
| `button_padding_horizontal` | range | no | snippets\css-variables.liquid:143:        --button-padding-x: {{ settings.button_padding_horizontal }}px; (**USER DECISION** if removed) |
| `button_padding_vertical` | range | no | snippets\css-variables.liquid:144:        --button-padding-y: {{ settings.button_padding_vertical }}px; (**USER DECISION** if removed) |
| `button_radius` | range | no | snippets\css-variables.liquid:146:        --button-radius: {{ settings.button_radius }}px; (**USER DECISION** if removed) |
| `button_shadow_blur` | range | no | snippets\css-variables.liquid:153:        --button-shadow-blur-radius: {{ settings.button_shadow_blur }}px; (**USER DECISION** if removed) |
| `button_shadow_horizontal_offset` | range | no | snippets\css-variables.liquid:151:        --button-shadow-horizontal-offset: {{ settings.button_shadow_horizontal_offset }}px; (**USER DECISION** if removed) |
| `button_shadow_opacity` | range | no | snippets\css-variables.liquid:150:        --button-shadow-opacity: {{ settings.button_shadow_opacity \| divided_by: 100.0 }}; (**USER DECISION** if removed) |
| `button_shadow_vertical_offset` | range | no | snippets\css-variables.liquid:152:        --button-shadow-vertical-offset: {{ settings.button_shadow_vertical_offset }}px; (**USER DECISION** if removed) |
| `cart_type` | select | no | layout\theme.liquid:72:        data-cart-type="{{ settings.cart_type }}"; snippets\buy-buttons.liquid:21:    @param {string} [cart_type] - Cart type override; defaults to settings.cart_type.; snippets\buy-buttons.liquid:35:{%- assign cart_type = cart_type \| default: settings.cart_type -%} (**USER DECISION** if removed) |
| `collection_navigation_batch_size` | range | no | sections\collection.liquid:22:        assign collection_nav_batch_size = settings.collection_navigation_batch_size \| default: 8 (**USER DECISION** if removed) |
| `collection_navigation_load_more_size` | range | no | sections\collection-navigation-items.liquid:2:    assign nav_batch_size = settings.collection_navigation_load_more_size \| default: 12; sections\collection.liquid:23:        assign collection_nav_load_more_size = settings.collection_navigation_load_more_size \| default: 12 (**USER DECISION** if removed) |
| `content_reveal_style` | select | no | layout\theme.liquid:76:        {% if settings.content_reveal_style != blank and settings.content_reveal_style != 'none' %}; layout\theme.liquid:77:            data-content-reveal-style="{{ settings.content_reveal_style }}" (**USER DECISION** if removed) |
| `dialog_border_thickness` | range | no | snippets\css-variables.liquid:156:        --dialog-border-width: {{ settings.dialog_border_thickness }}px; (**USER DECISION** if removed) |
| `dialog_radius` | range | no | snippets\css-variables.liquid:157:        --dialog-radius: {{ settings.dialog_radius }}px; (**USER DECISION** if removed) |
| `dialog_shadow_blur` | range | no | snippets\css-variables.liquid:162:        --dialog-shadow-blur-radius: {{ settings.dialog_shadow_blur }}px; (**USER DECISION** if removed) |
| `dialog_shadow_horizontal_offset` | range | no | snippets\css-variables.liquid:160:        --dialog-shadow-horizontal-offset: {{ settings.dialog_shadow_horizontal_offset }}px; (**USER DECISION** if removed) |
| `dialog_shadow_opacity` | range | no | snippets\css-variables.liquid:159:        --dialog-shadow-opacity: {{ settings.dialog_shadow_opacity \| divided_by: 100.0 }}; (**USER DECISION** if removed) |
| `dialog_shadow_vertical_offset` | range | no | snippets\css-variables.liquid:161:        --dialog-shadow-vertical-offset: {{ settings.dialog_shadow_vertical_offset }}px; (**USER DECISION** if removed) |
| `focus_ring_offset` | range | no | snippets\css-variables.liquid:225:        --focus-ring-offset: {{ settings.focus_ring_offset \| default: 2 }}px; (**USER DECISION** if removed) |
| `focus_ring_width` | range | no | snippets\css-variables.liquid:224:        --focus-ring-width: {{ settings.focus_ring_width \| default: 2 }}px; (**USER DECISION** if removed) |
| `input_border_thickness` | range | no | snippets\css-variables.liquid:133:        --input-border-width: {{ settings.input_border_thickness }}px; (**USER DECISION** if removed) |
| `input_padding_horizontal` | range | no | snippets\css-variables.liquid:134:        --input-padding-x: {{ settings.input_padding_horizontal }}px; (**USER DECISION** if removed) |
| `input_padding_vertical` | range | no | snippets\css-variables.liquid:135:        --input-padding-y: {{ settings.input_padding_vertical }}px; (**USER DECISION** if removed) |
| `input_radius` | range | no | snippets\css-variables.liquid:132:        --input-radius: {{ settings.input_radius }}px; (**USER DECISION** if removed) |
| `input_shadow_blur` | range | no | snippets\css-variables.liquid:140:        --input-shadow-blur-radius: {{ settings.input_shadow_blur }}px; (**USER DECISION** if removed) |
| `input_shadow_horizontal_offset` | range | no | snippets\css-variables.liquid:138:        --input-shadow-horizontal-offset: {{ settings.input_shadow_horizontal_offset }}px; (**USER DECISION** if removed) |
| `input_shadow_opacity` | range | no | snippets\css-variables.liquid:137:        --input-shadow-opacity: {{ settings.input_shadow_opacity \| divided_by: 100.0 }}; (**USER DECISION** if removed) |
| `input_shadow_vertical_offset` | range | no | snippets\css-variables.liquid:139:        --input-shadow-vertical-offset: {{ settings.input_shadow_vertical_offset }}px; (**USER DECISION** if removed) |
| `media_reveal_style` | select | no | layout\theme.liquid:79:        {% if settings.media_reveal_style != blank and settings.media_reveal_style != 'none' %}; layout\theme.liquid:80:            data-media-reveal-style="{{ settings.media_reveal_style }}" (**USER DECISION** if removed) |
| `motion_enabled` | checkbox | no | layout\theme.liquid:73:        {% if settings.motion_enabled == false %} (**USER DECISION** if removed) |
| `motion_speed` | select | no | snippets\css-variables.liquid:187:        {% case settings.motion_speed %} (**USER DECISION** if removed) |
| `predictive_search_enabled` | checkbox | no | sections\search-overlay.liquid:12:            data-predictive-search-enabled="{{ settings.predictive_search_enabled }}"; sections\search.liquid:18:            data-predictive-search-enabled="{{ settings.predictive_search_enabled }}" (**USER DECISION** if removed) |
| `product_card_border_thickness` | range | no | snippets\css-variables.liquid:165:        --product-card-border-width: {{ settings.product_card_border_thickness }}px; (**USER DECISION** if removed) |
| `product_card_radius` | range | no | snippets\css-variables.liquid:166:        --product-card-radius: {{ settings.product_card_radius }}px; (**USER DECISION** if removed) |
| `product_card_shadow_blur` | range | no | snippets\css-variables.liquid:171:        --product-card-shadow-blur-radius: {{ settings.product_card_shadow_blur }}px; (**USER DECISION** if removed) |
| `product_card_shadow_horizontal_offset` | range | no | snippets\css-variables.liquid:169:        --product-card-shadow-horizontal-offset: {{ settings.product_card_shadow_horizontal_offset }}px; (**USER DECISION** if removed) |
| `product_card_shadow_opacity` | range | no | snippets\css-variables.liquid:168:        --product-card-shadow-opacity: {{ settings.product_card_shadow_opacity \| divided_by: 100.0 }}; (**USER DECISION** if removed) |
| `product_card_shadow_vertical_offset` | range | no | snippets\css-variables.liquid:170:        --product-card-shadow-vertical-offset: {{ settings.product_card_shadow_vertical_offset }}px; (**USER DECISION** if removed) |
| `reveal_behavior` | select | no | layout\theme.liquid:82:        data-reveal-behavior="{{ settings.reveal_behavior \| default: 'once' }}" (**USER DECISION** if removed) |
| `subtitle_font_source` | select | no | snippets\css-variables.liquid:119:        {% if settings.subtitle_font_source == 'body' %} (**USER DECISION** if removed) |
| `subtitle_letter_spacing` | select | no | snippets\css-variables.liquid:128:        --font-subtitle-letter-spacing: {{ settings.subtitle_letter_spacing }}; (**USER DECISION** if removed) |
| `subtitle_line_height` | range | no | snippets\css-variables.liquid:127:        --font-subtitle-line-height: {{ settings.subtitle_line_height }}; (**USER DECISION** if removed) |
| `subtitle_text_transform` | select | no | snippets\css-variables.liquid:129:        --font-subtitle-text-transform: {{ settings.subtitle_text_transform }}; (**USER DECISION** if removed) |
| `subtitle_weight` | select | no | snippets\css-variables.liquid:126:        --font-subtitle-weight: {{ settings.subtitle_weight }}; (**USER DECISION** if removed) |
| `toast_duration` | range | no | snippets\ui-toast.liquid:22:    assign toast_duration_ms = settings.toast_duration \| times: 1000 (**USER DECISION** if removed) |
| `toast_position` | select | no | snippets\ui-toast.liquid:2:    case settings.toast_position; snippets\ui-toast.liquid:18:    if settings.toast_position == 'top-left' or settings.toast_position == 'top-center' or settings.toast_position == 'top-right' (**USER DECISION** if removed) |
| `toast_preview_persistent` | checkbox | no | snippets\ui-toast.liquid:27:        assign toast_preview_persistent = settings.toast_preview_persistent (**USER DECISION** if removed) |
| `toast_preview_type` | select | no | snippets\ui-toast.liquid:24:    if request.design_mode and settings.toast_preview_type != 'off' and settings.toast_preview_type != blank; snippets\ui-toast.liquid:26:        assign toast_preview_type = settings.toast_preview_type (**USER DECISION** if removed) |
| `toast_radius` | range | no | snippets\css-variables.liquid:174:        --toast-radius: {{ settings.toast_radius }}px; (**USER DECISION** if removed) |
| `toast_shadow_blur` | range | no | snippets\css-variables.liquid:179:        --toast-shadow-blur-radius: {{ settings.toast_shadow_blur }}px; (**USER DECISION** if removed) |
| `toast_shadow_horizontal_offset` | range | no | snippets\css-variables.liquid:177:        --toast-shadow-horizontal-offset: {{ settings.toast_shadow_horizontal_offset }}px; (**USER DECISION** if removed) |
| `toast_shadow_opacity` | range | no | snippets\css-variables.liquid:176:        --toast-shadow-opacity: {{ settings.toast_shadow_opacity \| divided_by: 100.0 }}; (**USER DECISION** if removed) |
| `toast_shadow_vertical_offset` | range | no | snippets\css-variables.liquid:178:        --toast-shadow-vertical-offset: {{ settings.toast_shadow_vertical_offset }}px; (**USER DECISION** if removed) |

### Shared IDs (29)

| ID | theme type | skeleton type | Referenced in merchant JSON | Notes |
| --- | --- | --- | --- | --- |
| `type_header_font` | font_picker | font_picker | **yes** | typography chain |
| `color_schemes` | color_scheme_group | color_scheme_group | **yes** | **USER DECISION** if structure changes |
| `body_font_size` | range | range | no |  |
| `body_font_size_mobile` | range | range | no |  |
| `body_letter_spacing` | select | select | no |  |
| `body_line_height` | range | range | no |  |
| `body_text_transform` | select | select | no |  |
| `favicon` | image_picker | image_picker | no |  |
| `heading_letter_spacing` | select | select | no |  |
| `heading_line_height` | range | range | no |  |
| `heading_scale` | range | range | no |  |
| `heading_text_transform` | select | select | no |  |
| `heading_weight` | select | select | no |  |
| `logo` | image_picker | image_picker | no |  |
| `logo_width` | range | range | no |  |
| `page_canvas_color_scheme` | color_scheme | color_scheme | no |  |
| `page_margin` | range | range | no |  |
| `page_width` | range | range | no |  |
| `product_card_image_ratio` | select | select | no |  |
| `social_facebook_link` | text | text | no |  |
| `social_instagram_link` | text | text | no |  |
| `social_pinterest_link` | text | text | no |  |
| `social_snapchat_link` | text | text | no |  |
| `social_tiktok_link` | text | text | no |  |
| `social_tumblr_link` | text | text | no |  |
| `social_twitter_link` | text | text | no |  |
| `social_vimeo_link` | text | text | no |  |
| `social_youtube_link` | text | text | no |  |
| `type_body_font` | font_picker | font_picker | no |  |
| `type_header_font` | font_picker | font_picker | no |  |
