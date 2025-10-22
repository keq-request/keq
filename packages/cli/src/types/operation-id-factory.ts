import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { ModuleDefinition } from '~/tasks/utils/module-definition.js'


export interface OperationIdFactoryOptions {
  module: ModuleDefinition

  method: string
  pathname: string
  operation: OpenAPIV3_1.OperationObject
}

export type OperationIdFactory = (context: OperationIdFactoryOptions) => string
