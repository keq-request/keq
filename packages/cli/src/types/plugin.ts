import type { Compiler } from '~/compiler/compiler.js'


export interface Plugin {
  apply(compiler: Compiler): void
}
