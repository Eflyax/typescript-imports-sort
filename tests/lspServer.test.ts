import {describe, expect, it} from 'vitest';
import {formatToEdits} from '../zed-extension/server/src/server';

describe('formatToEdits', () => {
	it('returns a full-document edit when formatting changes the text', () => {
		const input = "import b from 'b';\nimport a from 'a';\n";
		const edits = formatToEdits(input, '/x/file.ts');
		expect(edits).toHaveLength(1);
		expect(edits[0].range.start).toEqual({line: 0, character: 0});
		// input has 3 lines when split on '\n' (last is empty)
		expect(edits[0].range.end).toEqual({line: 2, character: 0});
		expect(edits[0].newText.indexOf("from 'a'")).toBeLessThan(edits[0].newText.indexOf("from 'b'"));
	});

	it('returns no edits when already formatted', () => {
		const input = '{\n\t"a": 1\n}';
		expect(formatToEdits(input, '/x/other.json')).toEqual([]);
	});
});
