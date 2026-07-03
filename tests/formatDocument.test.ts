import { describe, expect, it } from 'vitest';
import { formatDocument } from '../src/formatDocument';

describe('formatDocument', () => {
	it('sorts imports for a .ts file', () => {
		const input = "import b from 'b';\nimport a from 'a';\n";
		const out = formatDocument(input, '/x/file.ts');
		expect(out.indexOf("from 'a'")).toBeLessThan(out.indexOf("from 'b'"));
	});

	it('routes .json through full key sort for a non-package file', () => {
		const input = '{\n\t"b": 1,\n\t"a": 2\n}';
		const out = formatDocument(input, '/x/other.json');
		expect(out).toBe('{\n\t"a": 2,\n\t"b": 1\n}');
	});

	it('keeps package.json top-level order, sorts only dependency blocks', () => {
		const input = '{\n\t"name": "z",\n\t"dependencies": {\n\t\t"b": "1",\n\t\t"a": "1"\n\t}\n}';
		const out = formatDocument(input, '/repo/package.json');
		expect(out).toBe('{\n\t"name": "z",\n\t"dependencies": {\n\t\t"a": "1",\n\t\t"b": "1"\n\t}\n}');
	});

	it('returns unknown extensions unchanged', () => {
		expect(formatDocument('hello\n', '/x/file.md')).toBe('hello\n');
	});

	it('preserves two separate <style> blocks in Vue SFC (regression: greedy regex)', () => {
		const input = `<template><div>test</div></template>
<style scoped>
.a { color: red; }
</style>
<style>
.b { color: blue; }
</style>`;
		const output = formatDocument(input, '/x/comp.vue');
		const styleMatches = output.match(/<style/g);
		const closeMatches = output.match(/<\/style>/g);
		expect(styleMatches).toHaveLength(2);
		expect(closeMatches).toHaveLength(2);
		expect(output).toContain('.a { color: red; }');
		expect(output).toContain('.b { color: blue; }');
	});
});
