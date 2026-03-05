import {sortBlocks} from './formatters/blockSorter';
import {sortCss} from './formatters/cssSorter';
import {sortImports} from './formatters/importSorter';
import {sortVueComponents} from './formatters/vueComponentsSorter';
import {sortVueTemplateAttrs} from './formatters/vueAttrSorter';
import * as fs from 'fs';
import * as path from 'path';

const filePath = process.argv[2];

if (!filePath) {
    process.stderr.write('Usage: formatter.ts <file-path>\n');
    process.exit(1);
}

const ext = path.extname(filePath).toLowerCase();
let content: string;

const stdin = fs.readFileSync(0, 'utf-8');
if (stdin) {
    content = stdin;
} else {
    try {
        content = fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
        process.stderr.write(`Cannot read file: ${filePath}\n`);
        process.exit(1);
    }
}

function formatVue(src: string): string {
    const templateMatch = src.match(/(<template[^>]*>)([\s\S]*?)(<\/template>)/);
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

    return src;
}

function formatTs(src: string): string {
    src = sortImports(src);
    src = sortBlocks(src);
    return src;
}

function formatCss(src: string): string {
    return sortCss(src);
}

let result: string;

switch (ext) {
    case '.vue':
        result = formatVue(content);
        break;
    case '.ts':
    case '.js':
        result = formatTs(content);
        break;
    case '.css':
    case '.scss':
        result = formatCss(content);
        break;
    default:
        result = content;
}

process.stdout.write(result);
