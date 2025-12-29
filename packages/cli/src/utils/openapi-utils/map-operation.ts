import * as R from 'ramda'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { SupportedMethods } from '~/constants/supported-methods.js'


export type OpenapiOperationMapper = (method: string, pathname: string, operation: OpenAPIV3_1.OperationObject) => OpenAPIV3_1.OperationObject


export function mapOperation(specification: OpenAPIV3_1.Document, mapper: OpenapiOperationMapper): OpenAPIV3_1.Document {
  const shadow = R.clone(specification)

  for (const [pathname, pathItem] of Object.entries(shadow.paths || {})) {
    for (const m in pathItem) {
      const method = m.toLowerCase()
      if (!SupportedMethods.includes(method)) continue
      if (typeof pathItem[m] !== 'object' || Array.isArray(pathItem[m]) || pathItem[m] === null) continue

      const operation: OpenAPIV3_1.OperationObject = pathItem[m]
      pathItem[m] = mapper(method, pathname, operation)
    }
  }

  return shadow
}
