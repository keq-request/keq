import { upgrade } from '@scalar/openapi-parser'
import { Compiler } from '~/compiler/index.js'
import { Plugin } from '~/types/index.js'
import { OpenapiUtils } from '~/utils/openapi-utils/index.js'


export class TransformToOpenAPIv3_1Plugin implements Plugin {
  apply(compiler: Compiler): void {
    compiler.hooks.openapiTransform.tap(TransformToOpenAPIv3_1Plugin.name, (spec, moduleDefinition, task) => {
      let { specification } = upgrade(spec)

      OpenapiUtils.dereferenceOperation(specification)

      const rc = compiler.context.rc
      if (rc?.operationIdFactory) {
        const operationIdFactory = rc.operationIdFactory
        specification = OpenapiUtils.updateOperationId(
          specification,
          (method, pathname, operation) => operationIdFactory({ method, pathname, operation, module: moduleDefinition }),
        )
      }

      return specification
    })
  }
}
