#!/bin/bash
[[ $# -eq 0 ]] && { echo "need 1 argument"; exit 1; }
cd ..
grep -r -l "$1" .
