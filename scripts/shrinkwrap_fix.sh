#!/bin/bash
### lock down dependencies

npm install
npm prune
npm dedupe
npm install
npm shrinkwrap
