#!/bin/bash

#make sure to run with source command
for d in */; do
    if [ -d "$d" ];then
        cd "$d" && redis-server "redis.conf" &
    fi
done
