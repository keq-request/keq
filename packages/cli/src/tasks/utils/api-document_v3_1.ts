import * as R from 'ramda'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { ModuleDefinition } from './module-definition.js'
import { SupportedMethods } from '~/constants/supported-methods.js'
import { OperationDefinition } from './operation-definition.js'
import { SchemaDefinition } from './schema-definition.js'
import { logger } from '~/utils/logger.js'
import { openapiShakingSync } from '@opendoc/openapi-shaking'


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
        id: `#/components/schemas/${name}`,
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
      return this.schemas.find((schema) => schema.id === $ref)
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

  sharking(filter: (operationDefinition: OperationDefinition) => boolean): ApiDocumentV3_1 {
    const isAccepted = (pathname: string, method: string, operation: OpenAPIV3_1.Document): boolean => {
      if (!SupportedMethods.includes(method)) return false

      const operationDefinition = new OperationDefinition({
        method,
        pathname,
        operation,
        module: this.module,
        document: this,
      })

      return filter(operationDefinition)
    }


    const sharkedSwagger = openapiShakingSync(
      this.specification as any,
      isAccepted as any,
      { tolerant: true },
    ) as OpenAPIV3_1.Document

    return new ApiDocumentV3_1(
      sharkedSwagger,
      new ModuleDefinition(
        this.module.name,
        `file://${this.module.name}.v3_1.sharked.json`,
      ),
    )
  }
}
