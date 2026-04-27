import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  target: ['chrome91', 'firefox90', 'safari15', 'edge91', 'node20'],
  platform: 'neutral',
  format: ['cjs', 'esm'],
  tsconfig: 'tsconfig.lib.json',
  dts: { sourcemap: true },
  sourcemap: true,
  clean: true,
})
