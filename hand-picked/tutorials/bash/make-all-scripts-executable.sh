#!/bin/bash

TARGET_DIR=${1:-.}

total_files=0
sh_files=0
made_executable=0

echo "--- Analyzing and Updating Workspace: $TARGET_DIR ---"

while IFS= read -r -d '' file; do
    ((total_files++))

    if [[ "$file" == *.sh ]]; then
        ((sh_files++))

        if [[ ! -x "$file" ]]; then
            echo "Changing permissions: $file"
            chmod +x "$file"
            ((made_executable++))
        fi
    fi
done < <(find "$TARGET_DIR" -type f -print0)

echo "---------------------------------------"
echo "Total files scanned:    $total_files"
echo "Total .sh files found:  $sh_files"
echo "Permissions updated:    $made_executable"
echo "---------------------------------------"
