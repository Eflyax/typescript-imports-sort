import { describe, expect, it } from 'vitest';
import { sortJson } from '../src/formatters/jsonSorter';

describe('sortJson', () => {
    it('sorts all keys recursively for a generic .json file', () => {
        const input = '{\n\t"b": 1,\n\t"a": {\n\t\t"y": 1,\n\t\t"x": 2\n\t}\n}';
        const output = sortJson(input, '/some/path/other.json');
        expect(output).toBe('{\n\t"a": {\n\t\t"x": 2,\n\t\t"y": 1\n\t},\n\t"b": 1\n}');
    });

    it('sorts only dependency block values for package.json, keeping top-level order', () => {
        const input = [
            '{',
            '\t"name": "z-pkg",',
            '\t"scripts": {',
            '\t\t"test": "vitest",',
            '\t\t"build": "tsc"',
            '\t},',
            '\t"devDependencies": {',
            '\t\t"vitest": "^1.0.0",',
            '\t\t"@types/node": "^16.0.0"',
            '\t},',
            '\t"dependencies": {',
            '\t\t"tsx": "^4.0.0",',
            '\t\t"lodash": "^4.0.0"',
            '\t}',
            '}'
        ].join('\n');

        const expected = [
            '{',
            '\t"name": "z-pkg",',
            '\t"scripts": {',
            '\t\t"test": "vitest",',
            '\t\t"build": "tsc"',
            '\t},',
            '\t"devDependencies": {',
            '\t\t"@types/node": "^16.0.0",',
            '\t\t"vitest": "^1.0.0"',
            '\t},',
            '\t"dependencies": {',
            '\t\t"lodash": "^4.0.0",',
            '\t\t"tsx": "^4.0.0"',
            '\t}',
            '}'
        ].join('\n');

        expect(sortJson(input, '/repo/package.json')).toBe(expected);
    });

    it('detects package.json regardless of leading path separators', () => {
        const input = '{\n\t"z": 1,\n\t"dependencies": {\n\t\t"b": "1",\n\t\t"a": "1"\n\t}\n}';
        const expected = '{\n\t"z": 1,\n\t"dependencies": {\n\t\t"a": "1",\n\t\t"b": "1"\n\t}\n}';
        expect(sortJson(input, 'package.json')).toBe(expected);
        expect(sortJson(input, 'C:\\proj\\package.json')).toBe(expected);
    });
});
