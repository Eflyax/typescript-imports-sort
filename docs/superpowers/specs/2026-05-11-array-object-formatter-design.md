# Array-of-Objects Formatter — Design Spec

Date: 2026-05-11

## Summary

Add a new formatting phase that transforms inline arrays of objects (assigned to variables) into a consistent multiline format.

## Input / Output Example

**Before:**
```ts
const
    FUNCTIONAL_PAGES = [
        {slug: '/employees', title: 'Zaměstnanci', menuSection: 'employees', menuOrder: 0},
        {slug: '/reservations', title: 'Reservace', menuSection: 'reservations', menuOrder: 0}
    ];
```

**After:**
```ts
const
    FUNCTIONAL_PAGES = [{
        slug: '/employees',
        title: 'Zaměstnanci',
        menuSection: 'employees',
        menuOrder: 0
    }, {
        slug: '/reservations',
        title: 'Reservace',
        menuSection: 'reservations',
        menuOrder: 0
    }];
```

## Architecture

**New file:** `src/formatters/arrayObjectFormatter.ts`
**Exported function:** `formatArrayObjects(content: string): string`

**Integration in `formatter.ts`:**
- `formatTs()` — call `formatArrayObjects(src)` after `sortBlocks`
- `formatVue()` — call `formatArrayObjects(scriptContent)` in the script block after `sortBlocks`

The formatter is a pure string→string transform, consistent with all other formatters in the project.

## Detection

The formatter scans content line by line for variable assignment patterns:

```
<indent>(const|let|var <name> = [  OR  <IDENTIFIER> = [)
```

Specifically, it triggers when a line (after stripping leading whitespace) matches:
- `const <name> = [`
- `let <name> = [`
- `var <name> = [`
- `<IDENTIFIER> = [` (plain assignment)

Multi-line declarations (e.g. `const\n    NAME = [`) are also handled by scanning for `= [` anywhere on continuation lines.

## Formatter Logic

1. When `= [` is detected, use bracket-counting to collect the full array content (handles both inline and already-multiline arrays).
2. Strip all existing whitespace/newlines from the array interior and re-parse.
3. Extract individual objects `{...}` from the array using brace-counting (correctly handles nested objects and arrays as property values).
4. For each object, parse its properties using brace-counting (key: value pairs, values may contain `{`, `[`, `,`).
5. Reconstruct output with the target format (see Output Format below).
6. If the array contains no objects (empty array, or array of primitives), leave it unchanged.

## Output Format

```
[{
<indent+1tab>prop1: val1,
<indent+1tab>prop2: val2
}, {
<indent+1tab>prop1: val1
}]
```

Where `<indent>` matches the leading whitespace of the line containing `= [`.

Rules:
- Opening `[{` on the same line as the `=` assignment.
- Each property on its own line, indented one tab deeper than the assignment line.
- Comma after every property except the last in each object.
- `}, {` on its own line between objects (closing brace and opening brace on the same line).
- Closing `}]` on its own line at the assignment indent level, followed by `;` if the original had one.

## Property Handling

- Property order is preserved (no sorting).
- Values that are nested objects `{...}` or arrays `[...]` remain inline (no recursive expansion in v1).
- String values preserve their quotes.

## Testing

New scenario: `tests/inputScenarios/scenario15.ts` and `tests/outputScenarios/scenario15.ts`

Covers:
1. Array with multiple objects (the primary use case)
2. Array with a single object
3. Already-multiline array (normalized to canonical form)
4. Objects whose values include nested objects/arrays (values stay inline)
5. Array of primitives (skipped, left unchanged)
6. `const` / `let` / plain assignment variants
