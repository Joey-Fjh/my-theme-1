const { toLiquidHtmlAST, walk, LiquidHTMLCSTParsingError } = require('@shopify/liquid-html-parser');

/**
 * Parse a Liquid HTML source string into an AST.
 * Returns { ast } on success or { error: { message } } on parse failure.
 */
function parseLiquidAst(source) {
    try {
        const ast = toLiquidHtmlAST(source);
        return { ast };
    } catch (err) {
        if (err instanceof LiquidHTMLCSTParsingError) {
            return { error: { message: err.message } };
        }
        throw err;
    }
}

module.exports = { parseLiquidAst, walk };
