import * as R from 'ramda'
import { OpenAPIV3_1 } from '@scalar/openapi-types'
import { ModuleDefinition } from './module-definition'
import { SupportedMethods } from '~/constants/supported-methods'
import { OperationDefinition } from './operation-definition'
import { SchemaDefinition } from './schema-definition'
import { logger } from '~/utils/logger'
import { OperationFilter } from '~/types/operation-filter'
import { openapiShakingSync } from '@opendoc/openapi-shaking'


export class ApiDocumentV3_1 {
  readonly module: ModuleDefinition
  readonly swagger: OpenAPIV3_1.Document

  constructor(swagger: OpenAPIV3_1.Document, module: ModuleDefinition) {
    this.module = module
    this.swagger = swagger
  }

  get schemas(): SchemaDefinition[] {
    const module = this.module

    return Object.entries(this.swagger.components?.schemas || {})
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

    return Object.entries(this.swagger.paths || {})
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
    return R.isEmpty(this.swagger.paths)
  }

  dereference($ref: string): SchemaDefinition | undefined {
    if ($ref.startsWith('#/')) {
      return this.schemas.find((schema) => schema.id === $ref)
    }

    logger.warn(`The $ref(${$ref}) is not defined in ${this.module.name} swagger.`)
  }

  isRefDefined($ref: string): boolean {
    if ($ref.startsWith('#/')) {
      const path = $ref.replace('#/', '').split('/')
      return R.path(path, this.swagger) !== undefined
    }

    return false
  }

  sharking(filters: OperationFilter[]): ApiDocumentV3_1 {
    const isAccepted = (pathname: string, method: string): boolean => {
      if (!SupportedMethods.includes(method)) return false
      if (!filters.length) return true

      return !filters.every((f) => {
        if (f.method && method !== f.method.toLowerCase().trim()) return true
        if (f.pathname && pathname !== f.pathname.trim()) return true

        return false
      })
    }


    const sharkedSwagger = openapiShakingSync(
      this.swagger as any,
      isAccepted,
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
