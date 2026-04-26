import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    target: ['chrome91', 'firefox90', 'safari15', 'edge91', 'node20'],
    outDir: 'dist',
    platform: 'neutral',
    tsconfig: 'tsconfig.lib.json',
    dts: false,
    splitting: false,
    sourcemap: true,
    clean: true,
    onSuccess: 'tsc --emitDeclarationOnly -d --declarationMap -p ./tsconfig.lib.json && tsc-alias -p ./tsconfig.lib.json',
  },
  {
    entry: ['./plugins/index.ts'],
    format: ['cjs', 'esm'],
    outDir: 'dist/plugins',
    platform: 'node',
    target: ['node20'],
    dts: true,
    tsconfig: './plugins/tsconfig.json',
    external: ['@keq-request/cli', '@scalar/openapi-types'],
  },
])
