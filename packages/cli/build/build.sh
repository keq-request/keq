#!/bin/bash
function umd() {
  # Build UMD
  echo 'Building UMD...'
  cpx "./src/**/*.{hbs,json}" "dist/umd/src"
  tsc -p ./build/tsconfig.umd.json
  echo 'Build UMD Finished'
}

function esm() {
  # Build ESM
  echo 'Building ESM...'
  cpx "./src/**/*.{hbs,json}" "dist/esm/src"
  tsc -p ./build/tsconfig.esm.json
  echo 'Build ESM Finished'
}

umd &
PID_UMD=$!
esm &
PID_ESM=$!

wait $PID_UMD
wait $PID_ESM
