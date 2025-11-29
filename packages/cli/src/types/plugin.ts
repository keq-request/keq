import type { Compiler } from '~/compiler.js'


export interface Plugin {
  apply(compiler: Compiler): void
}
