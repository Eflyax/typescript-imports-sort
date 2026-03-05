#!/bin/bash
# $1 = project root
# $2 = buffer_path

exec "$1/node_modules/.bin/tsx" "$1/src/formatter.ts" "$2"
