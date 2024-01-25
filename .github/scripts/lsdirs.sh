!/bin/bash
# ohne Params, gibt es eine Liste von allen Verzeichnissen aus dem aktuellen Verzeichnis aus.
# Erstellt ein JSON-Objekt mit allen Lambda-Definitionen
directories=$(find ./* -type d -prune)
dirs="["
lambdi="{"
count=0

for dir in $directories; do
    dirs="$dirs\"$(echo "$dir" | sed 's/.\///')\","
    lambdi="$lambdi\"$count\": $(cat $dir/lambda_def.json), "
    count=$((count+1))
done

dirs="${dirs::-1}]"
lambdi="${lambdi::-2}}"

echo "$lambdi" > lambdi.json
echo "$dirs"