/**
 * Unloaded font weights (6-C3): each font role loads its base face and bold (700), plus italics.
 * A weight without a loaded face falls back silently, so markup and CSS use only regular and bold.
 */

const { pushFailure } = require('./lint-allow');
const { classCandidateTokens, splitVariants } = require('./migration-lint');

const CHECK_ID = 'unloaded-font-weight';
const UNLOADED_WEIGHT_UTILITY = /^font-(thin|extralight|light|medium|semibold|extrabold|black)$/;
const MESSAGE =
    'Only the regular and bold faces are loaded per font role (snippets/css-variables.liquid). ' +
    'Use font-normal / font-bold (400 / 700); another weight falls back to the nearest loaded face.';

function lineAt(text, offset) {
    return text.slice(0, offset).split(/\r\n|\r|\n/).length;
}

function isUnloadedWeightToken(token) {
    return UNLOADED_WEIGHT_UTILITY.test(splitVariants(token).utility);
}

function collectMarkupFontWeightFailures(text, file, failures, allowsByLine) {
    for (const { value, line } of classCandidateTokens(text)) {
        if (!isUnloadedWeightToken(value)) continue;
        pushFailure(failures, allowsByLine, file, line, CHECK_ID, `${MESSAGE} Found: ${value}.`);
    }
}

function collectCssFontWeightFailures(cssText, file, failures, allowsByLine, options = {}) {
    const { baseOffset = 0, lineText = cssText } = options;
    const stripped = cssText.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n\r]/g, ' '));
    for (const match of stripped.matchAll(/font-weight\s*:\s*(\d+(?:\.\d+)?|\.\d+)/g)) {
        if (match[1] === '400' || match[1] === '700') continue;
        pushFailure(
            failures,
            allowsByLine,
            file,
            lineAt(lineText, baseOffset + match.index),
            CHECK_ID,
            `${MESSAGE} Found: font-weight: ${match[1]}.`,
        );
    }
    for (const match of stripped.matchAll(/@apply\s+([^;]+);/g)) {
        const bad = match[1].split(/\s+/).filter(isUnloadedWeightToken);
        if (!bad.length) continue;
        pushFailure(
            failures,
            allowsByLine,
            file,
            lineAt(lineText, baseOffset + match.index),
            CHECK_ID,
            `${MESSAGE} Found: @apply ${bad.join(' ')}.`,
        );
    }
}

module.exports = {
    collectCssFontWeightFailures,
    collectMarkupFontWeightFailures,
    isUnloadedWeightToken,
};
