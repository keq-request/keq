import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
    plugins: 'src/plugins/index.ts',
    translators: 'src/translators/index.ts',
  },
  format: ['cjs', 'esm'],
  tsconfig: 'tsconfig.lib.json',
  dts: { sourcemap: true },
  sourcemap: true,
  clean: true,
  deps: { neverBundle: ['eslint'] },
})
