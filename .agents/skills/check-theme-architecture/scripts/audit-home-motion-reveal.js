#!/usr/bin/env node
/**
 * Audit homepage section motion reveal hooks (non-UI).
 * Usage: node .agents/skills/check-theme-architecture/scripts/audit-home-motion-reveal.js [template-json]
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../../../');
const templatePath =
    process.argv[2] || path.join(repoRoot, 'templates', 'index.json');
const sectionsDir = path.join(repoRoot, 'sections');

const SNIPPET_HOOKS = {
    'featured-products': [
        {
            source: 'snippets/product-card.liquid',
            content: 1,
            media: 0,
            note: 'per product card in active tab panel',
        },
    ],
    'blog-stories': [
        {
            source: 'snippets/image.liquid (default)',
            content: 0,
            media: 1,
            note: 'per article image when blog is set',
        },
    ],
    'promo-bannder': [
        {
            source: 'snippets/image.liquid (hero + cards)',
            content: 0,
            media: 1,
            note: 'per image wrapper unless motion_reveal: false',
        },
    ],
};

function stripLiquidComments(text) {
    return text.replace(/\{%-?#[\s\S]*?-?%}/g, '');
}

function countHooks(text) {
    const body = stripLiquidComments(text);
    return {
        motionSection: (body.match(/data-motion-section/g) || []).length,
        content: (body.match(/data-motion-reveal=["']content["']/g) || []).length,
        media: (body.match(/data-motion-reveal=["']media["']/g) || []).length,
    };
}

function readTemplateOrder() {
    const raw = fs.readFileSync(templatePath, 'utf8');
    const jsonText = raw.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '');
    const data = JSON.parse(jsonText);
    return data.order.map((id) => ({
        id,
        type: data.sections[id].type,
    }));
}

function main() {
    const order = readTemplateOrder();
    const rows = [];

    for (const { id, type } of order) {
        const sectionFile = path.join(sectionsDir, `${type}.liquid`);
        if (!fs.existsSync(sectionFile)) {
            rows.push({
                order: rows.length + 1,
                type,
                id,
                motionSection: 0,
                content: 0,
                media: 0,
                willAnimate: 'unknown (missing section file)',
            });
            continue;
        }

        const text = fs.readFileSync(sectionFile, 'utf8');
        const hooks = countHooks(text);
        const extras = SNIPPET_HOOKS[type] || [];
        const extraContent = extras.reduce((n, e) => n + e.content, 0);
        const extraMedia = extras.reduce((n, e) => n + e.media, 0);

        const hasRoot = hooks.motionSection > 0;
        const sectionTargets = hooks.content + hooks.media;
        const willAnimate =
            hasRoot && (sectionTargets > 0 || extras.length > 0)
                ? 'yes'
                : hasRoot
                  ? 'root only (no section-level targets)'
                  : 'no';

        rows.push({
            order: rows.length + 1,
            type,
            id,
            motionSection: hooks.motionSection,
            content: hooks.content,
            media: hooks.media,
            snippetNote: extras.map((e) => `${e.source}: +${e.content}c/+${e.media}m (${e.note})`).join('; ') || '',
            willAnimate,
        });
    }

    console.log('Homepage motion reveal audit');
    console.log(`Template: ${path.relative(repoRoot, templatePath)}`);
    console.log('');

    for (const row of rows) {
        console.log(
            `${row.order}. ${row.type}` +
                ` | data-motion-section: ${row.motionSection}` +
                ` | section targets content: ${row.content}, media: ${row.media}` +
                ` | animate: ${row.willAnimate}`,
        );
        if (row.snippetNote) {
            console.log(`   snippet hooks: ${row.snippetNote}`);
        }
    }

    console.log('');
    console.log('Summary');
    const animated = rows.filter((r) => r.willAnimate === 'yes');
    const staticSections = rows.filter((r) => r.willAnimate === 'no');
    console.log(`Animated sections: ${animated.map((r) => r.type).join(', ') || '(none)'}`);
    console.log(`No reveal: ${staticSections.map((r) => r.type).join(', ') || '(none)'}`);
}

main();
