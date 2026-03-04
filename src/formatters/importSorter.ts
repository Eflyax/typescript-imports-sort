type ImportKind = 'destructured' | 'default' | 'namespace' | 'type' | 'type-default' | 'sideEffect';

interface ImportItem {
    name: string;
    alias?: string;
}

interface ParsedImport {
    kind: ImportKind;
    items: ImportItem[];
    source: string;
    raw: string;
}

function parseImportStatement(raw: string): ParsedImport | null {
    const text = raw.replace(/\s+/g, ' ').trim();

    // Side-effect: import 'path';
    const sideEffectMatch = text.match(/^import\s+['"]([^'"]+)['"]\s*;?$/);
    if (sideEffectMatch) {
        return { kind: 'sideEffect', items: [], source: sideEffectMatch[1], raw };
    }

    // Type import: import type {...} from '...' or import type X from '...'
    const typeMatch = text.match(/^import\s+type\s+([\s\S]+?)\s+from\s+['"]([^'"]+)['"]\s*;?$/);
    if (typeMatch) {
        const spec = typeMatch[1].trim();
        if (spec.startsWith('{')) {
            // Destructured type: import type {A, B} from '...'
            const items = parseDestructuredItems(spec.replace(/^\{|\}$/g, ''));
            return { kind: 'type', items, source: typeMatch[2], raw };
        } else {
            // Default type: import type X from '...'
            return { kind: 'type-default', items: [{ name: spec }], source: typeMatch[2], raw };
        }
    }

    // Namespace: import * as X from '...'
    const namespaceMatch = text.match(/^import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;?$/);
    if (namespaceMatch) {
        return { kind: 'namespace', items: [{ name: namespaceMatch[1] }], source: namespaceMatch[2], raw };
    }

    // Destructured: import {...} from '...'
    const destructuredMatch = text.match(/^import\s+\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]\s*;?$/);
    if (destructuredMatch) {
        const items = parseDestructuredItems(destructuredMatch[1]);
        return { kind: 'destructured', items, source: destructuredMatch[2], raw };
    }

    // Default: import X from '...'
    const defaultMatch = text.match(/^import\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;?$/);
    if (defaultMatch) {
        return { kind: 'default', items: [{ name: defaultMatch[1] }], source: defaultMatch[2], raw };
    }

    return null;
}

function parseDestructuredItems(text: string): ImportItem[] {
    return text.split(',').map(s => s.trim()).filter(Boolean).map(parseItemAlias);
}

function parseItemAlias(itemText: string): ImportItem {
    const asMatch = itemText.match(/^(\S+)\s+as\s+(\S+)$/);
    if (asMatch) return { name: asMatch[1], alias: asMatch[2] };
    return { name: itemText };
}

function itemToString(item: ImportItem): string {
    return item.alias ? `${item.name} as ${item.alias}` : item.name;
}

function sortItems(items: ImportItem[]): ImportItem[] {
    return [...items].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
}

function getGroupSortKey(imp: ParsedImport): string {
    if (imp.items.length === 0) return '';
    if (imp.kind === 'type-default' || imp.kind === 'default' || imp.kind === 'namespace') {
        return imp.items[0].name.toLowerCase();
    }
    const sorted = sortItems(imp.items);
    return sorted[0].name.toLowerCase();
}

function formatImport(imp: ParsedImport): string {
    const LINE_LENGTH_LIMIT = 90;

    if (imp.kind === 'sideEffect') {
        return `import '${imp.source}';`;
    }

    if (imp.kind === 'namespace') {
        return `import * as ${imp.items[0].name} from '${imp.source}';`;
    }

    if (imp.kind === 'default') {
        return `import ${imp.items[0].name} from '${imp.source}';`;
    }

    if (imp.kind === 'type-default') {
        return `import type ${imp.items[0].name} from '${imp.source}';`;
    }

    // destructured or type (destructured type)
    const sorted = sortItems(imp.items);
    const prefix = imp.kind === 'type' ? 'import type ' : 'import ';
    const itemsStr = sorted.map(itemToString).join(', ');
    const singleLine = `${prefix}{${itemsStr}} from '${imp.source}';`;

    if (singleLine.length <= LINE_LENGTH_LIMIT) {
        return singleLine;
    }

    const itemLines = sorted.map((item, idx) =>
        idx < sorted.length - 1 ? `\t${itemToString(item)},` : `\t${itemToString(item)}`
    ).join('\n');
    return `${prefix}{\n${itemLines}\n} from '${imp.source}';`;
}

function mergeImports(imports: ParsedImport[]): ParsedImport[] {
    const map = new Map<string, ParsedImport>();

    for (const imp of imports) {
        if (imp.kind === 'sideEffect' || imp.kind === 'type-default' || imp.kind === 'default' || imp.kind === 'namespace') {
            // These don't merge
            const key = `${imp.kind}:${imp.source}:${imp.items[0]?.name}`;
            map.set(key, imp);
            continue;
        }
        // destructured and type (destructured) can be merged by source
        const key = `${imp.kind}:${imp.source}`;
        if (map.has(key)) {
            const existing = map.get(key)!;
            map.set(key, { ...existing, items: [...existing.items, ...imp.items] });
        } else {
            map.set(key, { ...imp });
        }
    }

    return Array.from(map.values());
}

function isImportComplete(line: string): boolean {
    // Import is complete on this line if braces are balanced (or there are none)
    const open = (line.match(/\{/g) || []).length;
    const close = (line.match(/\}/g) || []).length;
    return open === close;
}

function extractImportBlocks(content: string): Array<{ raw: string; lineStart: number; lineEnd: number }> {
    const lines = content.split('\n');
    const results: Array<{ raw: string; lineStart: number; lineEnd: number }> = [];
    let i = 0;

    while (i < lines.length) {
        const trimmed = lines[i].trimStart();
        if (trimmed.startsWith('import ') || trimmed === 'import') {
            const startLine = i;
            const importLines = [lines[i]];

            if (isImportComplete(lines[i])) {
                // Single-line or already-closed import (with or without semicolon)
                results.push({ raw: importLines.join('\n'), lineStart: startLine, lineEnd: i });
            } else {
                // Multi-line import: scan until balanced braces + semicolon
                let found = false;
                i++;
                while (i < lines.length) {
                    importLines.push(lines[i]);
                    const fullSoFar = importLines.join('\n');
                    const open = (fullSoFar.match(/\{/g) || []).length;
                    const close = (fullSoFar.match(/\}/g) || []).length;
                    if (open === close && fullSoFar.includes(';')) {
                        results.push({ raw: fullSoFar, lineStart: startLine, lineEnd: i });
                        found = true;
                        break;
                    }
                    i++;
                }
                if (!found) {
                    i--;
                }
            }
        }
        i++;
    }

    return results;
}

export function sortImports(content: string): string {
    const blocks = extractImportBlocks(content);
    if (blocks.length === 0) return content;

    const parsed: ParsedImport[] = [];
    for (const block of blocks) {
        const imp = parseImportStatement(block.raw);
        if (imp) parsed.push(imp);
    }

    if (parsed.length === 0) return content;

    const destructured = mergeImports(parsed.filter(i => i.kind === 'destructured'));
    const defaults = mergeImports(parsed.filter(i => i.kind === 'default'));
    const namespaces = mergeImports(parsed.filter(i => i.kind === 'namespace'));
    const types = mergeImports(parsed.filter(i => i.kind === 'type' || i.kind === 'type-default'));
    const sideEffects = parsed.filter(i => i.kind === 'sideEffect');

    const sortByKey = (arr: ParsedImport[]) =>
        [...arr].sort((a, b) => getGroupSortKey(a).localeCompare(getGroupSortKey(b)));

    const sorted = [
        ...sortByKey(destructured),
        ...sortByKey(defaults),
        ...sortByKey(namespaces),
        ...sortByKey(types),
        ...sideEffects,
    ];

    const newImportBlock = sorted.map(formatImport).join('\n');

    const firstLine = blocks[0].lineStart;
    const lastLine = blocks[blocks.length - 1].lineEnd;

    const lines = content.split('\n');
    const before = lines.slice(0, firstLine).join('\n');
    const after = lines.slice(lastLine + 1).join('\n');

    const parts: string[] = [];
    if (firstLine > 0) parts.push(before);
    parts.push(newImportBlock);
    if (lastLine < lines.length - 1) parts.push(after);

    return parts.join('\n');
}
