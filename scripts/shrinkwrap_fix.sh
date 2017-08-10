#!/bin/bash
### lock down dependencies
cd ../ || exit 1

npm install
npm update --save
npm prune
npm dedupe
npm shrinkwrap
