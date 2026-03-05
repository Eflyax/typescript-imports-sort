/**
 * Phase 2: Sort interface and enum members alphabetically.
 */

interface Member {
    hasComma: boolean;
    key: string;
    lines: string[];
}

function extractMemberKey(lines: string[]): string {
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;
        const match = trimmed.match(/^([A-Za-z_$][A-Za-z0-9_$?]*)/);
        return match ? match[1].toLowerCase() : trimmed.toLowerCase();
    }
    return '';
}

function lastContentLine(lines: string[]): string {
    for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].trim()) return lines[i];
    }
    return '';
}

function hasTrailingComma(lines: string[]): boolean {
    return lastContentLine(lines).trim().endsWith(',');
}

function stripTrailingComma(line: string): string {
    return line.replace(/,\s*$/, '');
}

function addTrailingComma(line: string): string {
    const t = line.trimEnd();
    return t.endsWith(',') ? line : t + ',';
}

function parseMembers(body: string): Member[] {
    const lines = body.split('\n');
    const members: Member[] = [];
    let currentLines: string[] = [];
    let inContent = false;
    let depth = 0;

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
            if (inContent) currentLines.push(line);
            continue;
        }

        const isComment = trimmed.startsWith('//') || trimmed.startsWith('*') ||
            trimmed.startsWith('/*') || trimmed.startsWith('*/');

        if (isComment) {
            currentLines.push(line);
            continue;
        }

        if (depth === 0) {
            if (inContent) {
                members.push({ lines: [...currentLines], key: extractMemberKey(currentLines), hasComma: hasTrailingComma(currentLines) });
                currentLines = [];
            }
            inContent = true;
        }

        currentLines.push(line);
        depth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
    }

    if (inContent && currentLines.length > 0) {
        members.push({ lines: [...currentLines], key: extractMemberKey(currentLines), hasComma: hasTrailingComma(currentLines) });
    }

    return members;
}

function processNestedBlocks(lines: string[]): string[] {
    const result: string[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const opens = (line.match(/\{/g) || []).length;
        const closes = (line.match(/\}/g) || []).length;

        if (opens > closes) {
            result.push(line);
            const bodyLines: string[] = [];
            let depth = opens - closes;
            i++;

            while (i < lines.length) {
                const o = (lines[i].match(/\{/g) || []).length;
                const c = (lines[i].match(/\}/g) || []).length;
                depth += o - c;

                if (depth <= 0) {
                    const sortedBody = sortAndRebuildBody(bodyLines.join('\n'), 'interface');
                    result.push(...processNestedBlocks(sortedBody.split('\n')));
                    result.push(lines[i]);
                    i++;
                    break;
                } else {
                    bodyLines.push(lines[i]);
                    i++;
                }
            }
        } else {
            result.push(line);
            i++;
        }
    }

    return result;
}

function extractNumericValue(lines: string[]): number | null {
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;
        const match = trimmed.match(/^[A-Za-z_$][A-Za-z0-9_$?]*\s*=\s*(-?\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]) : null;
    }
    return null;
}

function sortAndRebuildBody(body: string, blockType: 'interface' | 'enum'): string {
    const members = parseMembers(body);
    if (members.length <= 1) return body;

    let sorted: Member[];
    if (blockType === 'enum') {
        const numericValues = members.map(m => extractNumericValue(m.lines));
        const allNumeric = numericValues.every(v => v !== null);
        sorted = allNumeric
            ? [...members].sort((a, b) => extractNumericValue(a.lines)! - extractNumericValue(b.lines)!)
            : [...members].sort((a, b) => a.key.localeCompare(b.key));
    } else {
        sorted = [...members].sort((a, b) => a.key.localeCompare(b.key));
    }

    if (blockType === 'interface') {
        // Interface members: no comma manipulation, just reorder + recurse into nested blocks
        const resultParts: string[] = [];
        for (const member of sorted) {
            let memberLines = [...member.lines];
            while (memberLines.length > 0 && !memberLines[memberLines.length - 1].trim()) memberLines.pop();
            memberLines = processNestedBlocks(memberLines);
            resultParts.push(memberLines.join('\n'));
        }
        return resultParts.join('\n');
    }

    // Enum members: normalize commas
    // Did the original last member have a trailing comma (trailing comma style)?
    const lastHadComma = members[members.length - 1].hasComma;

    const resultParts: string[] = [];
    for (let i = 0; i < sorted.length; i++) {
        const member = sorted[i];
        const isLast = i === sorted.length - 1;
        const needsComma = isLast ? lastHadComma : true;

        const memberLines = [...member.lines];

        // Find last content line index
        let lastContentIdx = -1;
        for (let j = memberLines.length - 1; j >= 0; j--) {
            if (memberLines[j].trim()) { lastContentIdx = j; break; }
        }

        if (lastContentIdx >= 0) {
            if (needsComma) {
                memberLines[lastContentIdx] = addTrailingComma(memberLines[lastContentIdx]);
            } else {
                memberLines[lastContentIdx] = stripTrailingComma(memberLines[lastContentIdx]);
            }
        }

        while (memberLines.length > 0 && !memberLines[memberLines.length - 1].trim()) memberLines.pop();
        resultParts.push(memberLines.join('\n'));
    }

    return resultParts.join('\n');
}

function sortInterfacesAndEnums(content: string): string {
    const lines = content.split('\n');
    const result = [...lines];
    let i = 0;

    while (i < lines.length) {
        const trimmed = lines[i].trim();
        const blockMatch = trimmed.match(/^(?:export\s+)?(?:declare\s+)?((interface|enum))\s+\w[\w<>,\s]*\{(.*)$/);

        if (blockMatch) {
            const blockType = blockMatch[2] as 'interface' | 'enum';
            const openCount = (lines[i].match(/\{/g) || []).length;
            const closeCount = (lines[i].match(/\}/g) || []).length;

            if (openCount > closeCount) {
                const startLine = i;
                let depth = openCount - closeCount;
                let j = i + 1;

                while (j < lines.length && depth > 0) {
                    depth += (lines[j].match(/\{/g) || []).length;
                    depth -= (lines[j].match(/\}/g) || []).length;
                    j++;
                }

                const endLine = j - 1;
                const bodyLines = lines.slice(startLine + 1, endLine);
                const sortedBody = sortAndRebuildBody(bodyLines.join('\n'), blockType);
                const sortedLines = sortedBody.split('\n');

                result.splice(startLine + 1, endLine - startLine - 1, ...sortedLines);
                i = startLine + 1 + sortedLines.length;
                continue;
            }
        }

        i++;
    }

    return result.join('\n');
}

export function sortBlocks(content: string): string {
    return sortInterfacesAndEnums(content);
}
