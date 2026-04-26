import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  target: ['chrome91', 'firefox90', 'safari15', 'edge91', 'node20'],
  platform: 'neutral',
  tsconfig: 'tsconfig.lib.json',
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  onSuccess: 'tsc --emitDeclarationOnly -d --declarationMap -p ./tsconfig.lib.json && tsc-alias -p ./tsconfig.lib.json',
})
