#!/bin/bash
directories=$(find ./* -type d -prune)
# echo "Directories found: $directories"
dirs="["
for dir in $directories; do
    dirs="$dirs\"$(echo "$dir" | sed 's/.\///')\","
done
dirs="${dirs::-1}]"
echo "$dirs"