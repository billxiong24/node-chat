#!/bin/bash
#run this script as source
echo "$PWD"

for file in *; do
    if [ -f "$file" ]; then
        chmod +x "$file"
    fi
done


./clean.sh
./init.sh
./run.sh
./cluster.sh
