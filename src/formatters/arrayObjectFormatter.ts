function findMatchingBracket(content: string, openPos: number): number {
    let depth = 1;
    let i = openPos + 1;
    let inString: string | null = null;

    while (i < content.length) {
        const ch = content[i];
        if (inString) {
            if (ch === '\\') { i += 2; continue; }
            if (ch === inString) inString = null;
        } else {
            if (ch === '"' || ch === "'" || ch === '`') inString = ch;
            else if (ch === '[') depth++;
            else if (ch === ']') {
                depth--;
                if (depth === 0) return i;
            }
        }
        i++;
    }
    return -1;
}

function extractObjectStrings(flattened: string): Array<string> | null {
    const objects: Array<string> = [];
    let i = 0;

    while (i < flattened.length) {
        while (i < flattened.length && (flattened[i] === ' ' || flattened[i] === ',')) i++;
        if (i >= flattened.length) break;

        if (flattened[i] !== '{') return null;

        const start = i;
        let depth = 0;
        let inString: string | null = null;

        while (i < flattened.length) {
            const ch = flattened[i];
            if (inString) {
                if (ch === '\\') { i += 2; continue; }
                if (ch === inString) inString = null;
            } else {
                if (ch === '"' || ch === "'" || ch === '`') inString = ch;
                else if (ch === '{' || ch === '[' || ch === '(') depth++;
                else if (ch === '}' || ch === ']' || ch === ')') {
                    depth--;
                    if (depth === 0) { i++; break; }
                }
            }
            i++;
        }

        objects.push(flattened.slice(start, i).trim());
    }

    return objects.length > 0 ? objects : null;
}

function parseProperties(objStr: string): Array<{key: string; value: string}> {
    const inner = objStr.slice(1, -1).trim();
    const props: Array<{key: string; value: string}> = [];
    let i = 0;

    while (i < inner.length) {
        while (i < inner.length && inner[i] === ' ') i++;
        if (i >= inner.length) break;

        const keyStart = i;
        while (i < inner.length && inner[i] !== ':') i++;
        const key = inner.slice(keyStart, i).trim();
        i++;

        while (i < inner.length && inner[i] === ' ') i++;

        const valStart = i;
        let depth = 0;
        let inString: string | null = null;

        while (i < inner.length) {
            const ch = inner[i];
            if (inString) {
                if (ch === '\\') { i += 2; continue; }
                if (ch === inString) inString = null;
            } else {
                if (ch === '"' || ch === "'" || ch === '`') inString = ch;
                else if (ch === '{' || ch === '[' || ch === '(') depth++;
                else if (ch === '}' || ch === ']' || ch === ')') depth--;
                else if (ch === ',' && depth === 0) break;
            }
            i++;
        }

        props.push({key, value: inner.slice(valStart, i).trim()});
        if (i < inner.length && inner[i] === ',') i++;
    }

    return props;
}

function reconstructArray(
    objects: Array<Array<{key: string; value: string}>>,
    indent: string
): string {
    const propIndent = indent + '\t';
    const parts = objects.map(props =>
        props.map((p, i) => `${propIndent}${p.key}: ${p.value}${i < props.length - 1 ? ',' : ''}`).join('\n')
    );
    return `[{\n${parts.join('\n' + indent + '}, {\n')}\n${indent}}]`;
}

export function formatArrayObjects(content: string): string {
    const pattern = /^([ \t]*)(?:export[ \t]+)?(?:(?:const|let|var)[ \t]+)?[\w$][\w$]*[ \t]*=[ \t]*\[/gm;
    const matches = [...content.matchAll(pattern)];

    for (let m = matches.length - 1; m >= 0; m--) {
        const match = matches[m];
        const indent = match[1];
        const bracketPos = match.index! + match[0].length - 1;

        const closingPos = findMatchingBracket(content, bracketPos);
        if (closingPos === -1) continue;

        const arrayContent = content.slice(bracketPos + 1, closingPos);
        const flattened = arrayContent.replace(/\s+/g, ' ').trim();
        if (!flattened) continue;

        const objectStrings = extractObjectStrings(flattened);
        if (!objectStrings) continue;

        const objects = objectStrings.map(parseProperties);
        const formatted = reconstructArray(objects, indent);

        content = content.slice(0, bracketPos) + formatted + content.slice(closingPos + 1);
    }

    return content;
}
