#!/bin/bash
### lock down dependencies

sudo npm install
npm prune
sudo npm dedupe
sudo npm install
npm shrinkwrap
