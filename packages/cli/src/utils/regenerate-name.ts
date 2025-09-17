import * as R from 'ramda'
import { OpenAPIV3 } from 'openapi-types'
import { RuntimeConfig } from '~/types/runtime-config.js'
import { getSafeOperationName } from './get-safe-operation-name.js'
import { SupportedMethods } from '~/constants/supported-methods.js'


function regenerateOperationId(moduleName: string, document: OpenAPIV3.Document, rc: RuntimeConfig): OpenAPIV3.Document {
  const operationIdFactory = rc.operationIdFactory || rc.operationId
  if (!operationIdFactory) return document

  for (const [pathname, pathItem] of Object.entries(document.paths)) {
    for (const m in pathItem) {
      const method = m.toLowerCase()
      if (!SupportedMethods.includes(method)) continue
      if (typeof pathItem[m] !== 'object' || Array.isArray(pathItem[m])) continue

      const operation: OpenAPIV3.OperationObject = pathItem[m]

      operation.operationId = operationIdFactory({
        document,
        moduleName,
        pathname,
        method,
        operation,
      })

      operation.operationId = getSafeOperationName(pathname, method, operation)
    }
  }

  return document
}

export function regenerateName(modules: Record<string, OpenAPIV3.Document>, rc: RuntimeConfig): Record<string, OpenAPIV3.Document> {
  const newModules: Record<string, OpenAPIV3.Document> = {}
  for (const [moduleName, document] of Object.entries(modules)) {
    newModules[moduleName] = regenerateOperationId(moduleName, R.clone(document), rc)
  }

  return newModules
}
