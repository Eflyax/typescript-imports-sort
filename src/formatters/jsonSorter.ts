/**
 * Phase: Sort JSON object keys alphabetically.
 *
 * Sort rules (in priority order):
 * 1. Special/non-alphanumeric characters sort before letters (e.g. "{count}" before "Answer")
 * 2. Case-insensitive comparison
 * 3. Shorter key wins when one is a prefix of another (e.g. "Edit" before "Edit profile")
 */

function compareJsonKeys(a: string, b: string): number {
    const la = a.toLowerCase();
    const lb = b.toLowerCase();

    for (let i = 0; i < Math.min(la.length, lb.length); i++) {
        const ca = la.charCodeAt(i);
        const cb = lb.charCodeAt(i);

        if (ca === cb) continue;

        const aIsAlphaNum = (ca >= 97 && ca <= 122) || (ca >= 48 && ca <= 57);
        const bIsAlphaNum = (cb >= 97 && cb <= 122) || (cb >= 48 && cb <= 57);

        // Special characters sort before alphanumeric
        if (aIsAlphaNum && !bIsAlphaNum) return 1;
        if (!aIsAlphaNum && bIsAlphaNum) return -1;

        return ca - cb;
    }

    // Shorter key wins (prefix case)
    return la.length - lb.length;
}

function sortJsonValue(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(sortJsonValue);
    }
    if (value !== null && typeof value === 'object') {
        const obj = value as Record<string, unknown>;
        const sorted: Record<string, unknown> = {};
        for (const key of Object.keys(obj).sort(compareJsonKeys)) {
            sorted[key] = sortJsonValue(obj[key]);
        }
        return sorted;
    }
    return value;
}

// package.json: keep top-level key order intact, sort only the values of these blocks.
const PACKAGE_JSON_SORT_KEYS = ['dependencies', 'devDependencies', 'peerDependencies'];

function sortPackageJson(value: unknown): unknown {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        return value;
    }
    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
        const child = obj[key];
        const isSortable = child !== null && typeof child === 'object' && !Array.isArray(child);
        if (PACKAGE_JSON_SORT_KEYS.includes(key) && isSortable) {
            result[key] = sortJsonValue(child);
        } else {
            result[key] = child;
        }
    }
    return result;
}

function detectIndent(content: string): string | number {
    const match = content.match(/\{\s*\n([ \t]+)/);
    if (!match) return '\t';
    const indent = match[1];
    if (indent[0] === '\t') return '\t';
    return indent.length;
}

export function sortJson(content: string, fileName?: string): string {
    let parsed: unknown;
    try {
        parsed = JSON.parse(content);
    } catch {
        return content;
    }

    const isPackageJson = fileName !== undefined
        && fileName.replace(/\\/g, '/').split('/').pop() === 'package.json';
    const indent = detectIndent(content);
    const sorted = isPackageJson ? sortPackageJson(parsed) : sortJsonValue(parsed);
    const result = JSON.stringify(sorted, null, indent);
    // Preserve trailing newline if original had one
    return content.endsWith('\n') ? result + '\n' : result;
}
