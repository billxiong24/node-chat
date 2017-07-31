#!/bin/bash
chmod +x "shrinkwrap_fix.sh"
chmod +x "rmswp.sh"
./shrinkwrap_fix.sh || exit 1
./rmswp.sh

# use sed to remove all the color codes
# use tee to write to stdout while writing to file
gulp | sed -r "s/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]//g" | tee '../docs/result.txt'
