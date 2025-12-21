import { CompilerContext } from '~/compiler/index.js'


export interface BaseTaskOptions {
  enabled?: boolean | ((ctx: CompilerContext) => boolean | Promise<boolean>)
  skip?: boolean | string | ((ctx: CompilerContext) => boolean | string | Promise<boolean | string>)
}
