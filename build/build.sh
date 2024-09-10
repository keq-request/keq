#!/bin/bash

buildUMD() {
  echo "Building UMD bundle..."
  tsc -p ./build/tsconfig.umd.json
  echo '{"type": "commonjs"}' >./dist/umd/package.json
}

buildESM() {
  echo "Building ESM bundle..."
  tsc -p ./build/tsconfig.esm.json
  echo '{"type": "module"}' >./dist/esm/package.json
}

buildUMD &
buildESM

wait
