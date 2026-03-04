/**
 * Phase 4: Sort CSS properties in defined order.
 */

const CSS_ORDER: string[] = [
    "accent-color", "align-content", "align-items", "align-self", "all",
    "animation", "animation-delay", "animation-direction", "animation-duration",
    "animation-fill-mode", "animation-iteration-count", "animation-name",
    "animation-play-state", "animation-timing-function", "aspect-ratio",
    "backdrop-filter", "backface-visibility", "background", "background-attachment",
    "background-blend-mode", "background-clip", "background-color", "background-image",
    "background-origin", "background-position", "background-position-x",
    "background-position-y", "background-repeat", "background-size", "block-size",
    "border", "border-block", "border-block-color", "border-block-end",
    "border-block-end-color", "border-block-end-style", "border-block-end-width",
    "border-block-start", "border-block-start-color", "border-block-start-style",
    "border-block-start-width", "border-block-style", "border-block-width",
    "border-bottom", "border-bottom-color", "border-bottom-left-radius",
    "border-bottom-right-radius", "border-bottom-style", "border-bottom-width",
    "border-collapse", "border-color", "border-image", "border-image-outset",
    "border-image-repeat", "border-image-slice", "border-image-source",
    "border-image-width", "border-inline", "border-inline-color",
    "border-inline-end-color", "border-inline-end-style", "border-inline-end-width",
    "border-inline-start-color", "border-inline-start-style", "border-inline-start-width",
    "border-inline-style", "border-inline-width", "border-left", "border-left-color",
    "border-left-style", "border-left-width", "border-radius", "border-right",
    "border-right-color", "border-right-style", "border-right-width", "border-spacing",
    "border-style", "border-top", "border-top-color", "border-top-left-radius",
    "border-top-right-radius", "border-top-style", "border-top-width", "border-width",
    "bottom", "box-decoration-break", "box-reflect", "box-shadow", "box-sizing",
    "break-after", "break-before", "break-inside", "caption-side", "caret-color",
    "@charset", "clear", "clip", "color", "color-scheme", "column-count", "column-fill",
    "column-gap", "column-rule", "column-rule-color", "column-rule-style",
    "column-rule-width", "column-span", "column-width", "columns", "content",
    "counter-increment", "counter-reset", "cursor", "direction", "display",
    "empty-cells", "filter", "flex", "flex-basis", "flex-direction", "flex-flow",
    "flex-grow", "flex-shrink", "flex-wrap", "float", "font", "@font-face",
    "font-family", "font-feature-settings", "@font-feature-values", "font-kerning",
    "font-language-override", "font-size", "font-size-adjust", "font-stretch",
    "font-style", "font-synthesis", "font-variant", "font-variant-alternates",
    "font-variant-caps", "font-variant-east-asian", "font-variant-ligatures",
    "font-variant-numeric", "font-variant-position", "font-weight", "gap", "grid",
    "grid-area", "grid-auto-columns", "grid-auto-flow", "grid-auto-rows", "grid-column",
    "grid-column-end", "grid-column-gap", "grid-column-start", "grid-gap", "grid-row",
    "grid-row-end", "grid-row-gap", "grid-row-start", "grid-template",
    "grid-template-areas", "grid-template-columns", "grid-template-rows",
    "hanging-punctuation", "height", "hyphens", "image-rendering", "@import",
    "inline-size", "inset", "inset-block", "inset-block-end", "inset-block-start",
    "inset-inline", "inset-inline-end", "inset-inline-start", "isolation",
    "justify-content", "justify-items", "justify-self", "@keyframes", "left",
    "letter-spacing", "line-break", "line-height", "list-style", "list-style-image",
    "list-style-position", "list-style-type", "margin", "margin-block",
    "margin-block-end", "margin-block-start", "margin-bottom", "margin-inline",
    "margin-inline-end", "margin-inline-start", "margin-left", "margin-right",
    "margin-top", "mask", "mask-clip", "mask-composite", "mask-image", "mask-mode",
    "mask-origin", "mask-position", "mask-repeat", "mask-size", "mask-type",
    "max-height", "max-width", "@media", "max-block-size", "max-inline-size",
    "min-block-size", "min-inline-size", "min-height", "min-width", "mix-blend-mode",
    "object-fit", "object-position", "offset", "offset-anchor", "offset-distance",
    "offset-path", "offset-rotate", "opacity", "order", "orphans", "outline",
    "outline-color", "outline-offset", "outline-style", "outline-width", "overflow",
    "overflow-anchor", "overflow-wrap", "overflow-x", "overflow-y",
    "overscroll-behavior", "overscroll-behavior-block", "overscroll-behavior-inline",
    "overscroll-behavior-x", "overscroll-behavior-y", "padding", "padding-block",
    "padding-block-end", "padding-block-start", "padding-bottom", "padding-inline",
    "padding-inline-end", "padding-inline-start", "padding-left", "padding-right",
    "padding-top", "page-break-after", "page-break-before", "page-break-inside",
    "paint-order", "perspective", "perspective-origin", "place-content", "place-items",
    "place-self", "pointer-events", "position", "quotes", "resize", "right", "rotate",
    "row-gap", "scale", "scroll-behavior", "scroll-margin", "scroll-margin-block",
    "scroll-margin-block-end", "scroll-margin-block-start", "scroll-margin-bottom",
    "scroll-margin-inline", "scroll-margin-inline-end", "scroll-margin-inline-start",
    "scroll-margin-left", "scroll-margin-right", "scroll-margin-top", "scroll-padding",
    "scroll-padding-block", "scroll-padding-block-end", "scroll-padding-block-start",
    "scroll-padding-bottom", "scroll-padding-inline", "scroll-padding-inline-end",
    "scroll-padding-inline-start", "scroll-padding-left", "scroll-padding-right",
    "scroll-padding-top", "scroll-snap-align", "scroll-snap-stop", "scroll-snap-type",
    "scrollbar-color", "tab-size", "table-layout", "text-align", "text-align-last",
    "text-combine-upright", "text-decoration", "text-decoration-color",
    "text-decoration-line", "text-decoration-style", "text-decoration-thickness",
    "text-emphasis", "text-indent", "text-justify", "text-orientation", "text-overflow",
    "text-shadow", "text-transform", "text-underline-position", "top", "transform",
    "transform-origin", "transform-style", "transition", "transition-delay",
    "transition-duration", "transition-property", "transition-timing-function",
    "translate", "unicode-bidi", "user-select", "vertical-align", "visibility",
    "white-space", "widows", "width", "word-break", "word-spacing", "word-wrap",
    "writing-mode", "z-index",
];

const CSS_ORDER_MAP = new Map<string, number>(CSS_ORDER.map((prop, idx) => [prop, idx]));

interface CssDeclaration {
    property: string;
    value: string;
    raw: string;       // original text including indentation
    indent: string;
}

function getPropertyOrder(prop: string): number {
    // Exact match
    const idx = CSS_ORDER_MAP.get(prop);
    if (idx !== undefined) return idx;
    // Unknown property goes at the end
    return CSS_ORDER.length + 1;
}

function sortDeclarations(declarations: CssDeclaration[]): CssDeclaration[] {
    return [...declarations].sort((a, b) => {
        const orderA = getPropertyOrder(a.property);
        const orderB = getPropertyOrder(b.property);
        return orderA - orderB;
    });
}

/**
 * Sort CSS properties within a single rule block body.
 * body = content between { and } (not including the braces themselves)
 */
function sortRuleBody(body: string): string {
    const lines = body.split('\n');
    const declarations: CssDeclaration[] = [];
    const nestedBlocks: { placeholder: string; content: string }[] = [];
    let i = 0;
    const resultLines: string[] = [];

    // First pass: collect non-nested declarations, preserve nested blocks
    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        if (!trimmed) {
            // skip blank lines — will be handled via structure
            i++;
            continue;
        }

        // Check if this starts a nested block (SCSS nesting, @media inside rule, etc.)
        if (trimmed.endsWith('{') || (trimmed.includes('{') && !trimmed.includes(':'))) {
            // Nested block — find its end
            let depth = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
            const blockLines = [line];
            i++;
            while (i < lines.length && depth > 0) {
                depth += (lines[i].match(/\{/g) || []).length;
                depth -= (lines[i].match(/\}/g) || []).length;
                blockLines.push(lines[i]);
                i++;
            }
            const placeholder = `__NESTED_${nestedBlocks.length}__`;
            nestedBlocks.push({ placeholder, content: blockLines.join('\n') });
            resultLines.push(placeholder);
            continue;
        }

        // CSS declaration: property: value;
        // May span multiple lines if value has line continuations
        const declMatch = trimmed.match(/^([a-zA-Z_$-][a-zA-Z0-9_$-]*)\s*:/);
        if (declMatch) {
            const indentMatch = line.match(/^(\s*)/);
            const indent = indentMatch ? indentMatch[1] : '';
            const property = declMatch[1];
            let raw = line;

            // Multi-line value (value doesn't end with ;)
            while (!raw.trimEnd().endsWith(';') && i + 1 < lines.length) {
                i++;
                raw += '\n' + lines[i];
            }

            declarations.push({ property, value: '', raw, indent });
        } else {
            // Comments or other non-declaration lines
            resultLines.push(line);
        }
        i++;
    }

    if (declarations.length === 0) {
        return body;
    }

    const sorted = sortDeclarations(declarations);
    const sortedLines = sorted.map(d => d.raw);

    // Now rebuild: replace declaration area in resultLines with sorted declarations
    // resultLines may have nested block placeholders interspersed
    // Simple approach: put sorted declarations first, then nested blocks
    const nestedPlaceholderLines = resultLines.filter(l => l.includes('__NESTED_'));
    const otherLines = resultLines.filter(l => !l.includes('__NESTED_'));

    let output = [...sortedLines, ...nestedPlaceholderLines].join('\n');

    // Restore nested blocks
    for (const nb of nestedBlocks) {
        output = output.replace(nb.placeholder, nb.content);
    }

    return output;
}

/**
 * Process a CSS/SCSS string: find all rule blocks and sort their declarations.
 */
function processCssContent(content: string): string {
    const chars = content.split('');
    const result: string[] = [];
    let i = 0;

    while (i < chars.length) {
        // Skip comments
        if (chars[i] === '/' && chars[i + 1] === '*') {
            result.push(chars[i], chars[i + 1]);
            i += 2;
            while (i < chars.length) {
                if (chars[i] === '*' && chars[i + 1] === '/') {
                    result.push(chars[i], chars[i + 1]);
                    i += 2;
                    break;
                }
                result.push(chars[i]);
                i++;
            }
            continue;
        }

        // Line comment
        if (chars[i] === '/' && chars[i + 1] === '/') {
            while (i < chars.length && chars[i] !== '\n') {
                result.push(chars[i]);
                i++;
            }
            continue;
        }

        // String literals (don't process inside)
        if (chars[i] === '"' || chars[i] === "'") {
            const quote = chars[i];
            result.push(chars[i]);
            i++;
            while (i < chars.length && chars[i] !== quote) {
                if (chars[i] === '\\') { result.push(chars[i]); i++; }
                result.push(chars[i]);
                i++;
            }
            result.push(chars[i] || '');
            i++;
            continue;
        }

        if (chars[i] === '{') {
            // Find matching closing brace
            const bodyStart = i + 1;
            let depth = 1;
            let j = i + 1;

            while (j < chars.length && depth > 0) {
                if (chars[j] === '{') depth++;
                else if (chars[j] === '}') depth--;
                j++;
            }

            const body = chars.slice(bodyStart, j - 1).join('');
            const sortedBody = sortRuleBody(body);

            result.push('{');
            result.push(sortedBody);
            result.push('}');

            i = j;
            continue;
        }

        result.push(chars[i]);
        i++;
    }

    return result.join('');
}

export function sortCss(content: string): string {
    return processCssContent(content);
}
