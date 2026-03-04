/**
 * Phase 3: Sort Vue components{} object alphabetically.
 */

export function sortVueComponents(content: string): string {
    // Match: components: {\n...\n}
    // The components block may be single-line or multi-line
    return content.replace(
        /(components\s*:\s*\{)([^}]*?)(\})/g,
        (match, open, body, close) => {
            const items = body
                .split(',')
                .map((s: string) => s.trim())
                .filter(Boolean);

            if (items.length <= 1) return match;

            const sorted = [...items].sort((a: string, b: string) =>
                a.toLowerCase().localeCompare(b.toLowerCase())
            );

            // Determine indentation from original body
            const firstItem = body.match(/(\n\s*)\S/);
            if (firstItem) {
                const indent = firstItem[1]; // e.g., '\n\t\t'
                const sortedStr = sorted.map((item: string) => `${indent}${item}`).join(',');
                // trailing comma + newline before closing brace
                const closingIndent = body.match(/\n(\s*)\s*$/) ?
                    body.match(/\n(\s*)$/)![0] : '\n\t\t';
                return `${open}${sortedStr},${closingIndent}${close}`;
            }

            // Single-line fallback
            return `${open} ${sorted.join(', ')} ${close}`;
        }
    );
}
