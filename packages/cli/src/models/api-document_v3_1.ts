import * as R from 'ramda'
import { createHash } from 'crypto'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { ModuleDefinition } from './module-definition.js'
import { SupportedMethods } from '~/constants/supported-methods.js'
import { OperationDefinition } from './operation-definition.js'
import { SchemaDefinition } from './schema-definition.js'
import { ResponseDefinition } from './response-definition.js'
import { logger } from '~/utils/logger.js'


export class ApiDocumentV3_1 {
  readonly module: ModuleDefinition
  readonly specification: OpenAPIV3_1.Document
  readonly fingerprint: string

  constructor(specification: OpenAPIV3_1.Document, module: ModuleDefinition, fingerprint?: string) {
    this.module = module
    this.specification = specification
    this.fingerprint = fingerprint ?? createHash('md5').update(JSON.stringify(specification)).digest('hex')
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

  get responses(): ResponseDefinition[] {
    const module = this.module

    return Object.entries(this.specification.components?.responses || {})
      .filter((entry): entry is [string, OpenAPIV3_1.ResponseObject] => {
        const [, response] = entry
        return typeof response === 'object' && !('$ref' in response)
      })
      .map(([name, response]) => new ResponseDefinition({
        name,
        response,
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

  dereference($ref: string): SchemaDefinition | ResponseDefinition | undefined {
    if ($ref.startsWith('#/')) {
      if ($ref.startsWith('#/components/responses/')) {
        return this.responses.find((response) => response.id.endsWith($ref))
      }

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
