#!/bin/bash

TARGET_DIR=${1:-.}

echo "--- Analyzing Workspace: $TARGET_DIR ---"

STATS=$(find "$TARGET_DIR" -type f -print0 | xargs -0 wc | tail -n 1)
SIZE=$(du -sh "$TARGET_DIR" | cut -f1)

echo "Total size: $SIZE"
echo "$STATS" | awk '{printf "Total Lines: %s\nTotal Words: %s\nTotal Chars: %s\n", $1, $2, $3}'

