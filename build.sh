#!/bin/bash

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "In directory $DIR"

cd redisconf || echo "failed build";

#start redis cluster
printf 'yes' | ./build_cluster.sh

#run unit and integration tests (gulp clean && mocha)
npm test

./clean.sh
cd ../ || echo "failed to change to upper dir";
