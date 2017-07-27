#!/bin/bash
for i in $(seq 20); do
gulp clean && mocha test/models.js;
done
