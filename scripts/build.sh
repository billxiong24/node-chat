#!/bin/bash
# make sure folder permissions are set to your uid, not root
# otherwise, you have to use sudo

npm install -g express-generator@4.15.0 gulp@3.9.1 mocha@3.5.0 siege@0.2.0 || exit 1
npm install -g trucker@0.7.3 webpack@3.4.1 istanbul@0.4.5 jshint@2.9.5 || exit 1

chmod +x "shrinkwrap_fix.sh"
chmod +x "rmswp.sh"
./shrinkwrap_fix.sh || exit 1
./rmswp.sh

# use sed to remove all the color codes
# use tee to write to stdout while writing to file
gulp | sed -r "s/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]//g" | tee '../docs/result.txt'
