#!/bin/bash
# make sure folder permissions are set to your uid, not root
# otherwise, you have to use sudo

chmod +x "install_global.sh"
chmod +x "shrinkwrap_fix.sh"
chmod +x "rmswp.sh"

./install_global.sh
./shrinkwrap_fix.sh || exit 1
./rmswp.sh

# use sed to remove all the color codes
# use tee to write to stdout while writing to file
gulp | sed -r "s/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]//g" | tee '../docs/result.txt'
