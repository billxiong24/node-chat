#!/bin/bash
for d in *; do
    if [ -d "$d" ]; then
        echo "port $d 
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
appendonly yes" > "$d/redis.conf"
    fi

done;
