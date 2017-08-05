#!/bin/bash
for d in *; do
    if [ -d "$d" ];then
        rm "$d/dump.rdb" "$d/appendonly.aof" "$d/nodes.conf"
    fi
done

sudo service redis-server stop

for num in $(seq 6379 6384); do
    redis-cli -p "$num" shutdown
done
