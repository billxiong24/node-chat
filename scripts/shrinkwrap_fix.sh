#!/bin/bash
### lock down dependencies

sudo npm install
sudo npm prune
sudo npm dedupe
sudo npm install
npm shrinkwrap
