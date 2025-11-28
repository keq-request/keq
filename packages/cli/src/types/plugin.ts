import type { Compiler } from '~/compiler.js'


export abstract class Plugin {
  abstract apply(compiler: Compiler): void
}
