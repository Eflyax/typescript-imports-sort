/**
 * Phase 2: Sort interface and enum members alphabetically.
 */

interface Member {
    lines: string[];
    key: string;
    hasComma: boolean;
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

        if (inContent) {
            members.push({ lines: [...currentLines], key: extractMemberKey(currentLines), hasComma: hasTrailingComma(currentLines) });
            currentLines = [];
        }

        inContent = true;
        currentLines.push(line);
    }

    if (inContent && currentLines.length > 0) {
        members.push({ lines: [...currentLines], key: extractMemberKey(currentLines), hasComma: hasTrailingComma(currentLines) });
    }

    return members;
}

function sortAndRebuildBody(body: string, blockType: 'interface' | 'enum'): string {
    const members = parseMembers(body);
    if (members.length <= 1) return body;

    const sorted = [...members].sort((a, b) => a.key.localeCompare(b.key));

    if (blockType === 'interface') {
        // Interface members: no comma manipulation, just reorder
        const resultParts: string[] = [];
        for (const member of sorted) {
            const memberLines = [...member.lines];
            while (memberLines.length > 0 && !memberLines[memberLines.length - 1].trim()) memberLines.pop();
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
