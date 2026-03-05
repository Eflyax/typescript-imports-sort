/**
 * Phase 5: Sort Vue/HTML element attributes by category.
 *
 * Order:
 *  1  DEFINITION       – is, v-is
 *  2  LIST_RENDERING   – v-for
 *  3  CONDITIONALS     – v-if, v-else-if, v-else, v-show, v-cloak
 *  4  RENDER_MODIFIERS – v-pre, v-once
 *  5  GLOBAL           – id
 *  6  UNIQUE           – ref, key (and :ref, :key, v-bind:ref, v-bind:key)
 *  7  TWO_WAY_BINDING  – v-model, v-model:*
 *  8  OTHER_DIRECTIVES – everything not in another group (original order preserved)
 *  9  TEST_AND_STYLES  – test-id, class, :class, style (fixed order)
 * 10  EVENTS           – @*, v-on:*
 * 11  CONTENT          – v-html, v-text
 */

function getAttrCategory(name: string): number {
    if (name === 'is' || name === 'v-is' || name === ':is' || name === 'v-bind:is') return 1;
    if (name === 'v-for') return 2;
    if (['v-if', 'v-else-if', 'v-else', 'v-show', 'v-cloak'].includes(name)) return 3;
    if (name === 'v-pre' || name === 'v-once') return 4;
    if (name === 'id') return 5;
    if (['ref', ':ref', 'v-bind:ref', 'key', ':key', 'v-bind:key'].includes(name)) return 6;
    if (name === 'v-model' || name.startsWith('v-model:')) return 7;
    if (name === 'v-html' || name === 'v-text') return 11;
    if (name.startsWith('@') || name.startsWith('v-on:')) return 10;
    if (['test-id', 'class', ':class', 'style'].includes(name)) return 9;
    return 8;
}

interface ParsedAttr {
    name: string;
    raw: string;
    leading: string;
}

function attrSortKey(name: string): string {
    return name.replace(/^[:\@#]/, '').replace(/^v-bind:/, '');
}

const TEST_AND_STYLES_ORDER = ['test-id', 'class', ':class', 'style'];

function sortAttrs(attrs: ParsedAttr[]): ParsedAttr[] {
    return attrs.map((attr, idx) => ({ attr, idx })).sort((a, b) => {
        const catA = getAttrCategory(a.attr.name);
        const catB = getAttrCategory(b.attr.name);
        if (catA !== catB) return catA - catB;

        // OTHER_DIRECTIVES (8): preserve original order
        if (catA === 8) return a.idx - b.idx;

        // TEST_AND_STYLES (9): fixed order
        if (catA === 9) {
            return TEST_AND_STYLES_ORDER.indexOf(a.attr.name) - TEST_AND_STYLES_ORDER.indexOf(b.attr.name);
        }

        return 0;
    }).map(({ attr }) => attr);
}

function getLineIndent(result: string): string {
    const lastNewline = result.lastIndexOf('\n');
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
    const match = result.slice(lineStart).match(/^([ \t]*)/);
    return match ? match[1] : '';
}

export function sortVueTemplateAttrs(template: string): string {
    let result = '';
    let i = 0;

    while (i < template.length) {
        if (template[i] !== '<') {
            result += template[i++];
            continue;
        }

        // HTML comment: <!-- ... -->
        if (template.startsWith('<!--', i)) {
            const end = template.indexOf('-->', i + 4);
            if (end === -1) { result += template.slice(i); break; }
            result += template.slice(i, end + 3);
            i = end + 3;
            continue;
        }

        // Closing tag or doctype: </... or <!...
        if (template[i + 1] === '/' || template[i + 1] === '!') {
            result += template[i++];
            continue;
        }

        const tagStart = i;
        i++; // skip '<'

        // Read tag name
        let tagName = '';
        while (i < template.length && !/[ \t\n\r>\/]/.test(template[i])) {
            tagName += template[i++];
        }

        if (!tagName) {
            result += '<';
            continue;
        }

        // Parse attributes
        const attrs: ParsedAttr[] = [];
        let trailingWs = '';
        let selfClosing = false;
        let parseOk = true;

        while (i < template.length) {
            // Leading whitespace before each attribute
            let leading = '';
            while (i < template.length && /[ \t\n\r]/.test(template[i])) {
                leading += template[i++];
            }

            if (i >= template.length) { parseOk = false; break; }

            if (template[i] === '>') {
                trailingWs = leading; i++; break;
            }
            if (template[i] === '/' && i + 1 < template.length && template[i + 1] === '>') {
                trailingWs = leading; selfClosing = true; i += 2; break;
            }

            // Read attribute name
            let attrName = '';
            while (i < template.length && template[i] !== '=' && !/[ \t\n\r>\/]/.test(template[i])) {
                attrName += template[i++];
            }

            if (!attrName) { parseOk = false; break; }

            let attrRaw = attrName;

            if (i < template.length && template[i] === '=') {
                attrRaw += '=';
                i++;
                if (i < template.length && (template[i] === '"' || template[i] === "'")) {
                    const q = template[i];
                    attrRaw += q; i++;
                    while (i < template.length && template[i] !== q) {
                        if (template[i] === '\\') attrRaw += template[i++];
                        if (i < template.length) attrRaw += template[i++];
                    }
                    if (i < template.length) { attrRaw += template[i++]; }
                } else {
                    // Unquoted value
                    while (i < template.length && !/[ \t\n\r>]/.test(template[i])) {
                        attrRaw += template[i++];
                    }
                }
            }

            attrs.push({ name: attrName, raw: attrRaw, leading });
        }

        if (!parseOk) {
            // Failed to parse — output tag as-is
            result += template.slice(tagStart, i);
            continue;
        }

        const sorted = sortAttrs(attrs);
        const tagIndent = getLineIndent(result);

        // Detect attr indentation from original leading whitespace (multi-line tags
        // have '\n' in leading); fall back to tag indent + one level.
        const multiLineAttr = attrs.find(a => a.leading.includes('\n'));
        const attrIndent = multiLineAttr
            ? multiLineAttr.leading.replace(/^[\n\r]+/, '')
            : tagIndent + '\t';

        result += '<' + tagName;

        if (sorted.length === 0) {
            // No attributes
            result += trailingWs + (selfClosing ? '/>' : '>');
        } else if (sorted.length === 1) {
            // Single attribute → always one line
            result += ' ' + sorted[0].raw + (selfClosing ? ' />' : '>');
        } else {
            // Multiple attributes → always multi-line
            for (const attr of sorted) {
                result += '\n' + attrIndent + attr.raw;
            }
            result += '\n' + tagIndent + (selfClosing ? '/>' : '>');
        }
    }

    return result;
}
