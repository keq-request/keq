import * as R from 'ramda'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { mapOperation } from './map-operation.js'


export type OpenapiParameterMapper = (method: string, pathname: string, operation: OpenAPIV3_1.OperationObject, parameter: OpenAPIV3_1.ParameterObject) => OpenAPIV3_1.ParameterObject

export function mapParameter(
  specification: OpenAPIV3_1.Document,
  mapper: OpenapiParameterMapper,
): OpenAPIV3_1.Document {
  return mapOperation(specification, (method, pathname, operation) => {
    if (!operation.parameters) return operation

    operation.parameters = operation.parameters
      .map((parameter) => mapper(method, pathname, operation, parameter as OpenAPIV3_1.ParameterObject))

    return operation
  })
}
