const LINT_ALLOW_RE = /lint-allow\s+([a-z][a-z0-9-]*)\s*:\s*(.+)\S/i;

function extractAllowFromComment(comment) {
    const match = comment.match(LINT_ALLOW_RE);
    if (!match) return null;

    const reason = match[2].trim();
    if (!reason) return null;

    return { checkId: match[1], reason };
}

function parseLineAllows(text) {
    const allowsByLine = new Map();
    const lines = text.split(/\r\n|\r|\n/);

    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        const lineNumber = index + 1;

        const cssMatch = line.match(/\/\*\s*(.*?)\s*\*\//);
        if (cssMatch) {
            const parsed = extractAllowFromComment(cssMatch[1]);
            if (parsed) {
                allowsByLine.set(lineNumber + 1, parsed);
            }
        }

        const liquidMatch = line.match(/{%-?\s*#\s*(.*?)\s*-?%}/);
        if (liquidMatch) {
            const parsed = extractAllowFromComment(liquidMatch[1]);
            if (parsed) {
                allowsByLine.set(lineNumber + 1, parsed);
            }
        }
    }

    return allowsByLine;
}

function isAllowed(allowsByLine, line, checkId) {
    const entry = allowsByLine.get(line);
    return entry?.checkId === checkId;
}

function pushFailure(failures, allowsByLine, file, line, checkId, message) {
    if (isAllowed(allowsByLine, line, checkId)) {
        return;
    }

    failures.push({ file, line, checkId, message });
}

module.exports = {
    LINT_ALLOW_RE,
    extractAllowFromComment,
    parseLineAllows,
    isAllowed,
    pushFailure,
};
