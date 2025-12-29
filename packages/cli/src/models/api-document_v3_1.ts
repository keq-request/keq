import * as R from 'ramda'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { ModuleDefinition } from './module-definition.js'
import { SupportedMethods } from '~/constants/supported-methods.js'
import { OperationDefinition } from './operation-definition.js'
import { SchemaDefinition } from './schema-definition.js'
import { logger } from '~/utils/logger.js'


export class ApiDocumentV3_1 {
  readonly module: ModuleDefinition
  readonly specification: OpenAPIV3_1.Document

  constructor(specification: OpenAPIV3_1.Document, module: ModuleDefinition) {
    this.module = module
    this.specification = specification
  }

  get schemas(): SchemaDefinition[] {
    const module = this.module

    return Object.entries(this.specification.components?.schemas || {})
      .map(([name, schema]) => new SchemaDefinition({
        name,
        schema,
        module,
        document: this,
      }))
  }

  get operations(): OperationDefinition[] {
    const module = this.module

    return Object.entries(this.specification.paths || {})
      .flatMap(([pathname, pathItem]) => Object.entries(pathItem || {})
        .filter(([method]) => SupportedMethods.includes(method.toLowerCase()))
        .map(([method, operation]) => new OperationDefinition({
          method,
          pathname,
          operation,
          module,
          document: this,
        })))
  }

  isEmpty(): boolean {
    return R.isEmpty(this.specification.paths)
  }

  dereference($ref: string): SchemaDefinition | undefined {
    if ($ref.startsWith('#/')) {
      return this.schemas.find((schema) => schema.id.endsWith($ref))
    }

    logger.warn(`The $ref(${$ref}) is not defined in ${this.module.name} openapi/swagger.`)
  }

  isRefDefined($ref: string): boolean {
    if ($ref.startsWith('#/')) {
      const path = $ref.replace('#/', '').split('/')
      return R.path(path, this.specification) !== undefined
    }

    return false
  }

  static unknown(): ApiDocumentV3_1 {
    return new ApiDocumentV3_1({}, ModuleDefinition.unknown())
  }
}
