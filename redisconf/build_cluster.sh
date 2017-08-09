#!/bin/bash

#### starts the redis cluster ####
#### RUN THIS SCRIPT WITH SOURCE ####

for file in *; do
    if [ -f "$file" ]; then
        chmod +x "$file"
    fi
done


./clean.sh
./init.sh
./run.sh
./cluster.sh
