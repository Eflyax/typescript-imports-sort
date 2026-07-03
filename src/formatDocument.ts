import {formatArrayObjects} from './formatters/arrayObjectFormatter';
import {sortBlocks} from './formatters/blockSorter';
import {sortCss} from './formatters/cssSorter';
import {sortExports, sortImports} from './formatters/importSorter';
import {sortJson} from './formatters/jsonSorter';
import {sortVueComponents} from './formatters/vueComponentsSorter';
import {sortVueTemplateAttrs} from './formatters/vueAttrSorter';
import * as path from 'path';

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
		scriptContent = sortExports(scriptContent);
		scriptContent = sortBlocks(scriptContent);
		scriptContent = sortVueComponents(scriptContent);
		scriptContent = formatArrayObjects(scriptContent);
		src = src.replace(scriptMatch[0], `${scriptMatch[1]}${scriptContent}${scriptMatch[3]}`);
	}

	const styleMatch = src.match(/(<style[^>]*>)([\s\S]*)(<\/style>)/);
	if (styleMatch) {
		const sortedStyle = sortCss(styleMatch[2]);
		src = src.replace(styleMatch[0], `${styleMatch[1]}${sortedStyle}${styleMatch[3]}`);
	}

	src = src.replace(/(<\/template>)\s*\n\s*(<script)/g, '$1\n\n$2');
	src = src.replace(/(<script[^>]*\/>)\s*\n\s*(<style)/g, '$1\n$2');
	src = src.replace(/(<\/script>)\s*\n\s*(<style)/g, '$1\n$2');

	return src;
}

function formatTs(src: string): string {
	src = sortImports(src);
	src = sortExports(src);
	src = sortBlocks(src);
	src = formatArrayObjects(src);
	return src;
}

function formatCss(src: string): string {
	return sortCss(src);
}

function normalizeToTabs(content: string): string {
	const lines = content.split('\n');

	// Detect indentation unit: smallest leading-space count on indented lines
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

export function formatDocument(text: string, filePath: string): string {
	const ext = path.extname(filePath).toLowerCase();
	let result: string;

	switch (ext) {
		case '.vue':
			result = formatVue(text);
			break;
		case '.ts':
		case '.js':
			result = formatTs(text);
			break;
		case '.css':
		case '.scss':
			result = formatCss(text);
			break;
		case '.json':
			result = sortJson(text, filePath);
			break;
		default:
			result = text;
	}

	return normalizeToTabs(result);
}
