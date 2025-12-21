/* eslint-disable @typescript-eslint/no-unsafe-return */
import { fixSwagger } from 'swagger-fix'
import { Compiler } from '~/compiler/index.js'


export class ChineseToPinyinPlugin {
  apply(compiler: Compiler): void {
    compiler.hooks.openapiTransform.tap(ChineseToPinyinPlugin.name, (spec, task) => {
      return fixSwagger(spec as any)
    })
  }
}
