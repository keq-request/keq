#!/bin/bash
NODE_ENV=development

tsc -p build/tsconfig.lib.json -w &
tsc -p build/tsconfig.es.json -w
