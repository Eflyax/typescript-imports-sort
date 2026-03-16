#!/bin/bash

# Format all modified/added JS/TS/Vue/SCSS files on the current git branch.
# Usage: ./format-git-changed.sh [project-dir]
#   project-dir defaults to $ZED_WORKTREE_ROOT or cwd.

FORMATTER_ROOT="$(cd "$(dirname "$0")" && pwd)"
FORMATTER="$FORMATTER_ROOT/src/formatter.sh"
PROJECT_DIR="${1:-${ZED_WORKTREE_ROOT:-$PWD}}"

if [ ! -f "$FORMATTER" ]; then
    echo "Formatter not found: $FORMATTER" >&2
    exit 1
fi

if [ ! -d "$PROJECT_DIR/.git" ] && ! git -C "$PROJECT_DIR" rev-parse --git-dir > /dev/null 2>&1; then
    echo "Not a git repository: $PROJECT_DIR" >&2
    exit 1
fi

# Detect base branch (develop > main > master)
BASE_BRANCH=""
for candidate in develop main master; do
    if git -C "$PROJECT_DIR" rev-parse --verify "$candidate" > /dev/null 2>&1; then
        BASE_BRANCH="$candidate"
        break
    fi
done

if [ -z "$BASE_BRANCH" ]; then
    echo "Could not detect base branch (develop/main/master)." >&2
    exit 1
fi

MERGE_BASE=$(git -C "$PROJECT_DIR" merge-base HEAD "$BASE_BRANCH" 2>/dev/null)
echo "Base branch: $BASE_BRANCH (merge-base: ${MERGE_BASE:0:8})"

# Collect changed/added files: all commits on branch + uncommitted changes
{
    # All files changed in commits since branching off
    git -C "$PROJECT_DIR" diff --name-only --diff-filter=AM "$MERGE_BASE" HEAD 2>/dev/null

    # Staged changes
    git -C "$PROJECT_DIR" diff --name-only --diff-filter=AM --cached 2>/dev/null

    # Unstaged changes
    git -C "$PROJECT_DIR" diff --name-only --diff-filter=AM 2>/dev/null
} | sort -u | grep -E '\.(ts|js|vue|scss)$' > /tmp/git_changed_files_$$

# Filter to existing files only
existing=()
while IFS= read -r rel; do
    f="$PROJECT_DIR/$rel"
    [ -f "$f" ] && existing+=("$f")
done < /tmp/git_changed_files_$$
rm -f /tmp/git_changed_files_$$

total=${#existing[@]}

if [ "$total" -eq 0 ]; then
    echo "No changed JS/TS/Vue/SCSS files found on current branch."
    exit 0
fi

echo "Formatting $total changed file(s) in $PROJECT_DIR..."
echo ""

count=0
errors=0

for file in "${existing[@]}"; do
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
