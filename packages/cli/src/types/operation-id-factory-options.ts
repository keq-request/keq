import { OpenAPIV3 } from 'openapi-types'


export interface OperationIdFactoryOptions {
  moduleName: string
  document: OpenAPIV3.Document

  pathname: string
  method: string
  operation: OpenAPIV3.OperationObject
}
