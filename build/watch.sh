#!/bin/bash
NODE_ENV=development

tsc -p build/tsconfig.umd.json -w &
tsc -p build/tsconfig.esm.json -w
