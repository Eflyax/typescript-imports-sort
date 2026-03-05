#!/bin/bash

# Format all JS/TS/Vue/SCSS files in a project's src directory.
# Usage: ./format-src.sh [src-dir]
#   src-dir defaults to $ZED_WORKTREE_ROOT/src (set by Zed task runner),
#   or falls back to ./src relative to cwd.

FORMATTER_ROOT="$(cd "$(dirname "$0")" && pwd)"
FORMATTER="$FORMATTER_ROOT/src/formatter.sh"
SRC_DIR="${1:-${ZED_WORKTREE_ROOT:-$PWD}/src}"

if [ ! -f "$FORMATTER" ]; then
    echo "Formatter not found: $FORMATTER" >&2
    exit 1
fi

if [ ! -d "$SRC_DIR" ]; then
    echo "Source directory not found: $SRC_DIR" >&2
    exit 1
fi

files=()
while IFS= read -r -d '' file; do
    files+=("$file")
done < <(find "$SRC_DIR" -type f \( -name "*.ts" -o -name "*.js" -o -name "*.vue" -o -name "*.scss" \) -print0)
total=${#files[@]}

echo "Formatting $total file(s) in $SRC_DIR..."
echo ""

count=0
errors=0

for file in "${files[@]}"; do
    ((count++))
    remaining=$((total - count))
    tmp=$(mktemp)
    if "$FORMATTER" "$FORMATTER_ROOT" "$file" < "$file" > "$tmp"; then
        mv "$tmp" "$file"
        echo "  [$count/$total] formatted: $file  (remaining: $remaining)"
    else
        rm -f "$tmp"
        echo "  [$count/$total] error:     $file  (remaining: $remaining)" >&2
        ((errors++))
    fi
done

echo ""
echo "Done: $((count - errors)) file(s) formatted, $errors error(s)."
