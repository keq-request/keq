#!/bin/bash

tsc -p ./build/tsconfig.lib.json &
tsc -p ./build/tsconfig.es.json
