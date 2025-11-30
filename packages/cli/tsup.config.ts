import { defineConfig } from 'tsup'

export default defineConfig({
  // entry: ['src/index.ts', 'src/cli.ts', 'src/plugins/index.ts'],
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
    plugins: 'src/plugins/index.ts',
  },
  format: ['cjs', 'esm'],
  tsconfig: 'tsconfig.lib.json',
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['eslint'],
  onSuccess: 'tsc --emitDeclarationOnly -d --declarationMap -p ./tsconfig.lib.json && tsc-alias -p ./tsconfig.lib.json',
})
