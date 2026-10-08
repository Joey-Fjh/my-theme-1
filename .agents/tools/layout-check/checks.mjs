/**
 * In-page layout checks. Each export returns an array of { check, selector }.
 * Passed to page.evaluate; also used by the fixture suite via the same strings.
 */

const CHECK_HORIZONTAL_SCROLL = 'horizontal-scroll';
const CHECK_UNCLIPPED_OVERFLOW = 'unclipped-overflow';
const CHECK_PAGE_MARGIN = 'page-margin';
const CHECK_TAP_TARGETS = 'tap-targets';
const CHECK_CLIPPED_TEXT = 'clipped-text';

const TAP_SELECTOR =
    'button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="tab"], a[href]';

const MARGIN_CONTROL_SELECTOR =
    'h1,h2,h3,h4,h5,h6,p,button,a[href],input:not([type="hidden"]),select,textarea,label,summary,[role="button"],[role="tab"]';

export function checkHorizontalScroll() {
    const doc = document.documentElement;
    if (doc.scrollWidth > doc.clientWidth) {
        return [{ check: CHECK_HORIZONTAL_SCROLL, selector: 'html' }];
    }
    return [];
}

export function checkUnclippedOverflow() {
    const vw = document.documentElement.clientWidth;
    const issues = [];
    const seen = new Set();
    const elements = document.querySelectorAll('body *');

    for (const el of elements) {
        if (!isElementVisible(el)) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;

        const pastLeft = rect.left < -0.5;
        const pastRight = rect.right > vw + 0.5;
        if (!pastLeft && !pastRight) continue;

        if (pastLeft && isOverflowClippedOnEdge(el, 'left')) continue;
        if (pastRight && isOverflowClippedOnEdge(el, 'right')) continue;

        const selector = stableSelector(el);
        const key = `${CHECK_UNCLIPPED_OVERFLOW}:${selector}`;
        if (seen.has(key)) continue;
        seen.add(key);
        issues.push({ check: CHECK_UNCLIPPED_OVERFLOW, selector });
    }
    return issues;
}

export function checkPageMargin() {
    const margin = readPageMarginPx();
    const vw = document.documentElement.clientWidth;
    const maxRight = vw - margin;
    const issues = [];
    const seen = new Set();
    const roots = document.querySelectorAll('header, footer, section, main, [role="banner"], [role="contentinfo"]');
    const scopes = roots.length ? roots : [document.body];

    for (const scope of scopes) {
        const controls = scope.querySelectorAll(MARGIN_CONTROL_SELECTOR);
        for (const el of controls) {
            if (!isElementVisible(el)) continue;
            if (el.matches('img, picture, video, svg')) continue;
            if (el.closest('img, picture, video')) continue;

            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) continue;

            if (isDeliberatePeek(el, rect, vw)) continue;

            const leftOk = rect.left >= margin - 1;
            const rightOk = rect.right <= maxRight + 1;
            if (leftOk && rightOk) continue;

            const selector = stableSelector(el);
            const key = `${CHECK_PAGE_MARGIN}:${selector}`;
            if (seen.has(key)) continue;
            seen.add(key);
            issues.push({ check: CHECK_PAGE_MARGIN, selector });
        }
    }
    return issues;
}

export function checkTapTargets() {
    const candidates = [...document.querySelectorAll(TAP_SELECTOR)].filter((el) => {
        if (!isElementVisible(el)) return false;
        if (el.matches('input[type="hidden"]')) return false;
        if (el.matches('a[href]') && isInlineTextLink(el)) return false;
        return true;
    });

    const targets = candidates.map((el) => {
        const rect = el.getBoundingClientRect();
        return { el, rect, selector: stableSelector(el) };
    });

    const undersized = targets.filter(
        (t) => t.rect.width < 24 - 0.5 || t.rect.height < 24 - 0.5,
    );

    const issues = [];
    const seen = new Set();

    for (const t of undersized) {
        if (passesSpacingException(t, targets)) continue;
        const key = `${CHECK_TAP_TARGETS}:${t.selector}`;
        if (seen.has(key)) continue;
        seen.add(key);
        issues.push({ check: CHECK_TAP_TARGETS, selector: t.selector });
    }
    return issues;
}

export function checkClippedText() {
    const issues = [];
    const seen = new Set();
    const elements = document.querySelectorAll('body *');

    for (const el of elements) {
        if (!isElementVisible(el)) continue;
        if (!elementHasOwnText(el)) continue;

        const style = getComputedStyle(el);
        if (style.overflow === 'visible' && style.overflowX === 'visible' && style.overflowY === 'visible') {
            continue;
        }
        if (hasTextEllipsisOrLineClamp(style)) continue;

        const sw = el.scrollWidth;
        const sh = el.scrollHeight;
        const cw = el.clientWidth;
        const ch = el.clientHeight;
        if (sw <= cw + 1 && sh <= ch + 1) continue;

        const selector = stableSelector(el);
        const key = `${CHECK_CLIPPED_TEXT}:${selector}`;
        if (seen.has(key)) continue;
        seen.add(key);
        issues.push({ check: CHECK_CLIPPED_TEXT, selector });
    }
    return issues;
}

export function runLayoutChecksInPage() {
    return [
        ...checkHorizontalScroll(),
        ...checkUnclippedOverflow(),
        ...checkPageMargin(),
        ...checkTapTargets(),
        ...checkClippedText(),
    ];
}

export const CHECK_NAMES = [
    CHECK_HORIZONTAL_SCROLL,
    CHECK_UNCLIPPED_OVERFLOW,
    CHECK_PAGE_MARGIN,
    CHECK_TAP_TARGETS,
    CHECK_CLIPPED_TEXT,
    'runtime',
];

function readPageMarginPx() {
    const probe = document.createElement('div');
    probe.setAttribute('data-layout-check-probe', 'page-margin');
    probe.style.cssText =
        'position:absolute;left:0;top:0;visibility:hidden;pointer-events:none;width:var(--page-margin);height:1px;';
    document.documentElement.appendChild(probe);
    const margin = probe.getBoundingClientRect().width;
    probe.remove();
    return margin > 0 ? margin : 16;
}

function isElementVisible(el) {
    if (!(el instanceof Element)) return false;
    if (el.closest('template')) return false;
    if (el.closest('[inert]')) return false;
    if (el.closest('[aria-hidden="true"]')) return false;

    const closedDialog = el.closest('dialog:not([open])');
    if (closedDialog) return false;

    const details = el.closest('details');
    if (details && !details.open) {
        const summary = details.querySelector('summary');
        if (summary && !summary.contains(el) && el !== summary) return false;
    }

    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;

    return true;
}

function ancestorClipsHorizontal(style) {
    const ox = style.overflowX;
    return ox === 'hidden' || ox === 'clip' || ox === 'scroll' || ox === 'auto';
}

function isOverflowClippedOnEdge(el, edge) {
    const eRect = el.getBoundingClientRect();
    let node = el.parentElement;
    while (node && node !== document.documentElement) {
        const style = getComputedStyle(node);
        if (style.clipPath && style.clipPath !== 'none') return true;
        if (!ancestorClipsHorizontal(style)) {
            node = node.parentElement;
            continue;
        }
        const aRect = node.getBoundingClientRect();
        if (edge === 'left' && eRect.left < aRect.left - 0.5) return true;
        if (edge === 'right' && eRect.right > aRect.right + 0.5) return true;
        node = node.parentElement;
    }
    return false;
}

function hasClippingAncestor(el, edge) {
    const vw = document.documentElement.clientWidth;
    let node = el.parentElement;
    while (node && node !== document.documentElement) {
        const style = getComputedStyle(node);
        if (style.clipPath && style.clipPath !== 'none') return true;
        if (ancestorClipsHorizontal(style)) {
            const rect = node.getBoundingClientRect();
            if (edge === 'left' && rect.left <= 0 && rect.width < vw) return true;
            if (edge === 'right' && rect.right >= vw && rect.width < vw) return true;
        }
        node = node.parentElement;
    }
    return false;
}

function isDeliberatePeek(el, rect, vw) {
    const partlyOutside = rect.left < 0 || rect.right > vw;
    if (!partlyOutside) return false;
    if (rect.left < 0 && hasClippingAncestor(el, 'left')) return true;
    if (rect.right > vw && hasClippingAncestor(el, 'right')) return true;
    return false;
}

function isInlineTextLink(link) {
    if (!link.matches('a[href]')) return false;
    const block = nearestBlockAncestor(link);
    if (!block) return false;
    return blockHasTextOutsideLink(block, link);
}

function nearestBlockAncestor(el) {
    let node = el.parentElement;
    while (node && node !== document.body) {
        const display = getComputedStyle(node).display;
        if (display === 'block' || display === 'flex' || display === 'grid' || display === 'list-item') {
            return node;
        }
        node = node.parentElement;
    }
    return el.parentElement;
}

function blockHasTextOutsideLink(block, link) {
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
        const text = node.textContent?.trim();
        if (!text) continue;
        const parentEl = node.parentElement;
        if (!parentEl) continue;
        if (link.contains(parentEl) || parentEl === link) continue;
        if (!isElementVisible(parentEl)) continue;
        return true;
    }
    return false;
}

function passesSpacingException(target, allTargets) {
    const cx = target.rect.left + target.rect.width / 2;
    const cy = target.rect.top + target.rect.height / 2;
    const r = 12;

    for (const other of allTargets) {
        if (other.el === target.el) continue;
        const otherUndersized =
            other.rect.width < 24 - 0.5 || other.rect.height < 24 - 0.5;
        if (otherUndersized) {
            const ocx = other.rect.left + other.rect.width / 2;
            const ocy = other.rect.top + other.rect.height / 2;
            if (Math.hypot(cx - ocx, cy - ocy) < r + r - 0.01) return false;
        } else if (circleIntersectsRect(cx, cy, r, other.rect)) {
            return false;
        }
    }
    return true;
}

function circleIntersectsRect(cx, cy, r, rect) {
    const closestX = Math.max(rect.left, Math.min(cx, rect.right));
    const closestY = Math.max(rect.top, Math.min(cy, rect.bottom));
    return Math.hypot(cx - closestX, cy - closestY) < r - 0.01;
}

function elementHasOwnText(el) {
    for (const node of el.childNodes) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) return true;
    }
    return false;
}

function hasTextEllipsisOrLineClamp(style) {
    if (style.textOverflow === 'ellipsis') return true;
    const webkitLineClamp = style.webkitLineClamp;
    if (webkitLineClamp && webkitLineClamp !== 'none' && webkitLineClamp !== '0') return true;
    return false;
}

/**
 * Selector path rule: keep BEM / component classes (`__`, `--`) or one non-utility class;
 * omit Tailwind-style utilities so spacing tweaks do not rename issues.
 */
const UTILITY_CLASS_PATTERNS = [
    /^(sm|md|lg|xl|2xl|pc|max-|min-|hover:|focus:|data-|sr-only|container-page)/,
    /^m[trblxy]?(-|$)/,
    /^p[trblxy]?(-|$)/,
    /^gap-/,
    /^w-/,
    /^h-/,
    /^min-w-/,
    /^min-h-/,
    /^max-w-/,
    /^max-h-/,
    /^flex(-|$)/,
    /^grid(-|$)/,
    /^items-/,
    /^justify-/,
    /^self-/,
    /^text-/,
    /^font-/,
    /^bg-/,
    /^border(-|$)/,
    /^rounded/,
    /^order-/,
    /^col-/,
    /^row-/,
    /^space-/,
    /^inset(-|$)/,
    /^top-/,
    /^left-/,
    /^right-/,
    /^bottom-/,
    /^z-/,
    /^opacity-/,
    /^overflow/,
    /^pointer-events-/,
    /^cursor-/,
    /^pe-/,
    /^ps-/,
    /^pt-/,
    /^pb-/,
    /^pl-/,
    /^pr-/,
    /^px-/,
    /^py-/,
    /^mx-/,
    /^my-/,
    /^mt-/,
    /^mb-/,
    /^ms-/,
    /^me-/,
    /^no-scrollbar/,
    /^(inline|block|hidden|relative|absolute|fixed|sticky)$/,
    /^container$/,
];

function isUtilityClass(className) {
    if (className.includes('__') || className.includes('--')) return false;
    if (className.includes('[') || className.includes(':') || className.includes('/')) return true;
    return UTILITY_CLASS_PATTERNS.some((re) => re.test(className));
}

function classesForSelector(el) {
    const names = [...el.classList];
    const component = names.filter((c) => c.includes('__') || c.includes('--'));
    if (component.length) {
        return component.slice(0, 2).map((c) => `.${cssEscape(c)}`).join('');
    }
    const semantic = names.find((c) => !isUtilityClass(c));
    if (semantic) return `.${cssEscape(semantic)}`;
    return '';
}

export function normalizeShopifySectionId(id) {
    return normalizeShopifyElementId(id);
}

/** Strip theme template / section-group numeric segments from any element or section id. */
export function normalizeShopifyElementId(id) {
    return String(id)
        .replace(/template--\d+__/g, 'template__')
        .replace(/sections--\d+__/g, 'sections__')
        .replace(/^shopify-section-template--\d+(__)/, 'shopify-section-template$1')
        .replace(/^shopify-section-sections--\d+(__)/, 'shopify-section-sections$1');
}

function elementIdString(el) {
    const raw = el.getAttribute?.('id') ?? el.id;
    return raw == null ? '' : String(raw);
}

export function stableSelector(el) {
    if (!(el instanceof Element)) return 'unknown';
    const elementId = elementIdString(el);
    if (elementId) {
        return `#${cssEscape(normalizeShopifyElementId(elementId))}`;
    }

    const section =
        el.closest('section[id]') ||
        el.closest('[id^="shopify-section"]') ||
        el.closest('[id]');
    let sectionPart = 'body';
    const sectionId = section ? elementIdString(section) : '';
    if (sectionId) {
        sectionPart = `#${cssEscape(normalizeShopifyElementId(sectionId))}`;
    }

    const path = [];
    let node = el;
    while (node && node !== section && node !== document.body) {
        const tag = node.tagName.toLowerCase();
        const classes = classesForSelector(node);
        const parent = node.parentElement;
        if (!parent) break;
        const siblings = [...parent.children].filter((c) => c.tagName === node.tagName);
        const index = siblings.indexOf(node) + 1;
        path.unshift(`${tag}${classes}:nth-of-type(${index})`);
        node = parent;
    }
    return path.length ? `${sectionPart} > ${path.join(' > ')}` : sectionPart;
}

function cssEscape(value) {
    if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(value);
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
}

export function checkModuleMountState() {
    const issues = [];
    const roots = document.querySelectorAll('[data-module-id]');
    for (const root of roots) {
        if (!isElementVisible(root)) continue;
        const stack = root._x_dataStack;
        const pending = root.__themeModulePending;
        if (!stack || pending) {
            issues.push({
                check: 'runtime',
                selector: stableSelector(root),
                detail: pending ? 'module-pending' : 'alpine-not-mounted',
            });
        }
    }
    return issues;
}
