import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    target: ['chrome91', 'firefox90', 'safari15', 'edge91', 'node20'],
    outDir: 'dist',
    platform: 'neutral',
    tsconfig: 'tsconfig.lib.json',
    dts: { sourcemap: true },
    sourcemap: true,
    clean: true,
  },
  {
    entry: ['./plugins/index.ts'],
    format: ['cjs', 'esm'],
    outDir: 'dist/plugins',
    platform: 'neutral',
    target: ['node20'],
    dts: true,
    tsconfig: './plugins/tsconfig.json',
    deps: { neverBundle: ['@keq-request/cli', '@scalar/openapi-types'] },
  },
])
