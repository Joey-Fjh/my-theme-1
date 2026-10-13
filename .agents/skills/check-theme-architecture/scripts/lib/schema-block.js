/** Matches a section schema block, with or without whitespace trim markers. */
const SCHEMA_BLOCK_RE = /{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/;

/** First schema block match (`match[1]` is the JSON text, `match.index` its tag start), or null. */
function matchSchemaBlock(text) {
    return text.match(SCHEMA_BLOCK_RE);
}

module.exports = { matchSchemaBlock };
