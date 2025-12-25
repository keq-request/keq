
import { fixSwagger } from 'swagger-fix'
import { Compiler } from '~/compiler/index.js'
import { ApiDocumentV3_1 } from '~/models/index.js'


export class ChineseToPinyinPlugin {
  apply(compiler: Compiler): void {
    compiler.hooks.afterDownload.tap(ChineseToPinyinPlugin.name, (task) => {
      const documents = compiler.context.documents!

      compiler.context.documents = documents.map((doc) => {
        return new ApiDocumentV3_1(
          fixSwagger(doc.specification as any),
          doc.module,
        )
      })
    })
  }
}
