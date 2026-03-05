import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';
import { sortBlocks } from '../src/formatters/blockSorter';
import { sortCss } from '../src/formatters/cssSorter';
import { sortImports } from '../src/formatters/importSorter';
import { sortVueTemplateAttrs } from '../src/formatters/vueAttrSorter';
import { sortVueComponents } from '../src/formatters/vueComponentsSorter';

function normalizeToTabs(content: string): string {
    const lines = content.split('\n');
    let indentSize = 0;
    for (const line of lines) {
        const match = line.match(/^( +)\S/);
        if (match) {
            const count = match[1].length;
            if (indentSize === 0 || count < indentSize) indentSize = count;
        }
    }
    if (indentSize === 0) return content;
    return lines.map(line => {
        const match = line.match(/^( +)/);
        if (!match) return line;
        const count = match[1].length;
        const tabCount = Math.floor(count / indentSize);
        const remainder = count % indentSize;
        return '\t'.repeat(tabCount) + ' '.repeat(remainder) + line.slice(count);
    }).join('\n');
}

function formatTs(src: string): string {
    src = sortImports(src);
    src = sortBlocks(src);
    return normalizeToTabs(src);
}

function formatVue(src: string): string {
    const templateMatch = src.match(/(<template[^>]*>)([\s\S]*)(<\/template>)/);
    if (templateMatch) {
        const sortedTemplate = sortVueTemplateAttrs(templateMatch[2]);
        src = src.replace(templateMatch[0], `${templateMatch[1]}${sortedTemplate}${templateMatch[3]}`);
    }

    const scriptMatch = src.match(/(<script[^>]*>)([\s\S]*?)(<\/script>)/);
    if (scriptMatch) {
        let scriptContent = scriptMatch[2];
        scriptContent = sortImports(scriptContent);
        scriptContent = sortBlocks(scriptContent);
        scriptContent = sortVueComponents(scriptContent);
        src = src.replace(scriptMatch[0], `${scriptMatch[1]}${scriptContent}${scriptMatch[3]}`);
    }

    const styleMatch = src.match(/(<style[^>]*>)([\s\S]*?)(<\/style>)/);
    if (styleMatch) {
        const sortedStyle = sortCss(styleMatch[2]);
        src = src.replace(styleMatch[0], `${styleMatch[1]}${sortedStyle}${styleMatch[3]}`);
    }

    return normalizeToTabs(src);
}

function formatCss(src: string): string {
    return normalizeToTabs(sortCss(src));
}

function format(content: string, ext: string): string {
    switch (ext) {
        case '.vue': return formatVue(content);
        case '.ts':
        case '.js': return formatTs(content);
        case '.css':
        case '.scss': return formatCss(content);
        default: return content;
    }
}

const inputDir = path.join(__dirname, 'inputScenarios');
const outputDir = path.join(__dirname, 'outputScenarios');
const inputFiles = fs.readdirSync(inputDir).sort();

describe('formatter scenarios', () => {
    for (const file of inputFiles) {
        const outputFile = path.join(outputDir, file);
        if (!fs.existsSync(outputFile)) continue;

        it(file, () => {
            const input = fs.readFileSync(path.join(inputDir, file), 'utf-8');
            const expected = fs.readFileSync(outputFile, 'utf-8');
            const ext = path.extname(file).toLowerCase();
            expect(format(input, ext)).toBe(expected);
        });
    }
});
