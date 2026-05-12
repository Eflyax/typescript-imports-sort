import {describe, expect, it} from 'vitest';
import {isExcluded} from '../src/formatters/exclusionFilter';

const makeSettings = (exclusions: Array<string>): string =>
    JSON.stringify({file_scan_exclusions: exclusions});

describe('isExcluded', () => {
    it('matches **/src/lib/naive-ui/* pattern', () => {
        const settings = makeSettings(['**/src/lib/naive-ui/*']);
        expect(isExcluded('/project/src/lib/naive-ui/lib/alert/index.js', settings)).toBe(true);
    });

    it('matches bare filename yarn.lock anywhere in path', () => {
        const settings = makeSettings(['yarn.lock']);
        expect(isExcluded('/some/project/yarn.lock', settings)).toBe(true);
    });

    it('does not exclude unrelated file', () => {
        const settings = makeSettings(['**/src/lib/naive-ui/*', 'yarn.lock']);
        expect(isExcluded('/project/src/components/Foo.ts', settings)).toBe(false);
    });

    it('returns false for empty exclusions array', () => {
        const settings = makeSettings([]);
        expect(isExcluded('/project/src/lib/naive-ui/Foo.ts', settings)).toBe(false);
    });

    it('returns false for malformed settings JSON', () => {
        expect(isExcluded('/any/file.ts', 'not json')).toBe(false);
    });

    it('returns false when file_scan_exclusions key is missing', () => {
        expect(isExcluded('/any/file.ts', '{}')).toBe(false);
    });

    it('ignores commented-out patterns in JSONC', () => {
        const settings = `{
            "file_scan_exclusions": []
            // "**/naive-ui/*"
        }`;
        expect(isExcluded('/project/src/lib/naive-ui/Foo.ts', settings)).toBe(false);
    });
});
