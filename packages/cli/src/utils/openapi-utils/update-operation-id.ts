import * as R from 'ramda'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { SupportedMethods } from '~/constants/supported-methods.js'


type OperationUpdater = (method: string, pathname: string, operation: OpenAPIV3_1.OperationObject) => string | undefined


export function updateOperationId(swagger: OpenAPIV3_1.Document, fn: OperationUpdater): OpenAPIV3_1.Document {
  const shadow = R.clone(swagger)

  for (const [pathname, pathItem] of Object.entries(shadow.paths || {})) {
    for (const m in pathItem) {
      const method = m.toLowerCase()
      if (!SupportedMethods.includes(method)) continue
      if (typeof pathItem[m] !== 'object' || Array.isArray(pathItem[m]) || pathItem[m] === null) continue

      const operation: OpenAPIV3_1.OperationObject = pathItem[m]
      const operationId = fn(method, pathname, operation)

      if (typeof operationId === 'string' && operationId.length > 0) {
        operation.operationId = operationId
      }
    }
  }

  return shadow
}
