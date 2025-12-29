import { OpenAPIV3_1 } from '@scalar/openapi-types'
import { Compiler } from '~/compiler/index.js'
import { Exception } from '~/exception.js'
import { ApiDocumentV3_1 } from '~/models/api-document_v3_1.js'
import { ModuleDefinition } from '~/models/module-definition.js'
import { Plugin } from '~/types/plugin.js'
import { OpenapiUtils } from '~/utils/openapi-utils/index.js'


/**
 * A factory function that generates an operationId for a given operation.
 * If undefined is returned, the operationId will not be modified.
 */
export type OperationIdFactory = (context: {
  module: ModuleDefinition
  method: string
  pathname: string
  operation: OpenAPIV3_1.OperationObject
}) => string | undefined


export class OverwriteOperationIdPlugin implements Plugin {
  constructor(private readonly factory: OperationIdFactory) {}

  apply(compiler: Compiler): void {
    compiler.hooks.afterDownload.tap(OverwriteOperationIdPlugin.name, () => {
      const documents = compiler.context.documents!
      const factory = this.factory

      compiler.context.documents = documents.map((document) => {
        const spec = OpenapiUtils.mapOperation(
          document.specification,
          (method, pathname, operation) => {
            const operationId = factory({ method, pathname, operation, module: document.module })
            if (typeof operationId === 'string') {
              if (operationId.length === 0) {
                throw new Exception(document.module, `The generated operationId for [${method.toUpperCase()} ${pathname}] is an empty string.`)
              }
              operation.operationId = operationId
              return operation
            }

            return operation
          },
        )

        return new ApiDocumentV3_1(spec, document.module)
      })
    })
  }
}
