#!/bin/bash

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "In directory $DIR"
cd redisconf || echo "failed build";

#start redis cluster
printf 'yes' | ./build_cluster.sh

#run unit and integration tests (gulp clean && mocha)
if [ "$#" -gt 0 ] && [ "$1" == "cover" ]; then
    echo "================================"
    echo "Running code coverage test"
    echo "================================"
    cd ../ || exit 1
    gulp clean && istanbul cover _mocha || exit 1    
    cd redisconf || exit 1
else
    echo "================================"
    echo "Running unit and integration tests"
    echo "================================"
    npm test || exit 1
fi



./clean.sh
cd ../ || echo "failed to change to upper dir";
