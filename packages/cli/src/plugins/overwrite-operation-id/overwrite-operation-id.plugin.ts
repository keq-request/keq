import { OpenAPIV3_1 } from '@scalar/openapi-types'
import { Compiler } from '~/compiler/index.js'
import { ApiDocumentV3_1 } from '~/models/api-document_v3_1.js'
import { ModuleDefinition } from '~/models/module-definition.js'
import { Plugin } from '~/types/plugin.js'
import { OpenapiUtils } from '~/utils/openapi-utils/index.js'


export interface OperationIdFactoryOptions {
  module: ModuleDefinition

  method: string
  pathname: string
  operation: OpenAPIV3_1.OperationObject
}

export type OperationIdFactory = (context: OperationIdFactoryOptions) => string


export class OverwriteOperationIdPlugin implements Plugin {
  constructor(private readonly factory: OperationIdFactory) {}

  apply(compiler: Compiler): void {
    compiler.hooks.afterDownload.tap(OverwriteOperationIdPlugin.name, () => {
      const documents = compiler.context.documents!
      const factory = this.factory

      compiler.context.documents = documents.map((document) => {
        const spec = OpenapiUtils.updateOperationId(
          document.specification,
          (method, pathname, operation) => factory({ method, pathname, operation, module: document.module }),
        )

        return new ApiDocumentV3_1(spec, document.module)
      })
    })
  }
}
