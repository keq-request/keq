import * as R from 'ramda'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { ModuleDefinition } from './module-definition.js'
import { isKeywords } from '~/utils/is-keywords.js'
import { isReservedWord } from '~/utils/is-reserved-word.js'
import { ApiDocumentV3_1 } from './api-document_v3_1.js'
import { JSONPath } from 'jsonpath-plus'
import { SchemaDefinition } from './schema-definition.js'
import { ResponseDefinition } from './response-definition.js'
import { JsonSchemaUtils } from '~/utils/json-schema-utils/index.js'


export class OperationDefinition {
  readonly module: ModuleDefinition

  readonly operationId: string
  readonly method: string
  readonly pathname: string
  readonly operation: OpenAPIV3_1.OperationObject
  readonly document: ApiDocumentV3_1

  get id(): string {
    return `${this.module.address.url}#/paths/${this.pathname}/${this.method}`
  }

  constructor(args: {
    method: string
    pathname: string
    operation: OpenAPIV3_1.OperationObject
    module: ModuleDefinition
    document: ApiDocumentV3_1
  }) {
    this.module = args.module
    this.method = args.method.toLowerCase()
    this.pathname = args.pathname
    this.document = args.document
    this.operationId = this.formatOperationId(args.method, args.pathname, args.operation)

    this.operation = {
      ...args.operation,
      operationId: this.operationId,
    }
  }

  private formatOperationId(method: string, pathname: string, operation: OpenAPIV3_1.OperationObject): string {
    const operationId = operation.operationId

    if (
      operationId
      && operationId !== 'index'
      && !isKeywords(operationId)
      && !isReservedWord(operationId)
    ) {
      return operationId as string
    }

    return `${method}_${pathname}`
      .replace(/\//g, '_')
      .replace(/-/g, '_')
      .replace(/:/g, '$$')
      .replace(/{(.+)}/, '$$$1')
  }

  getDependencies(): SchemaDefinition[] {
    const refs = R.uniq([
      ...JSONPath<string>({
        path: '$.requestBody.content..schema..$ref',
        json: this.operation,
      }),
      ...JSONPath<string>({
        path: '$.responses..content..schema..$ref',
        json: this.operation,
      }),
      ...JSONPath<string>({
        path: '$.parameters..schema..$ref',
        json: this.operation,
      }),
    ])

    const dependencies = refs
      .filter((ref) => typeof ref === 'string' && ref)
      .map((ref) => {
        const definition = this.document.dereference(ref)
        if (definition instanceof SchemaDefinition) return definition

        return SchemaDefinition.unknown()
      })

    return dependencies
  }

  getResponseDependencies(): ResponseDefinition[] {
    const responses = this.operation.responses || {}

    return R.uniqBy(
      (dep) => dep.id,
      Object.values(responses)
        .filter((response): response is OpenAPIV3_1.ReferenceObject => JsonSchemaUtils.isRef(response))
        .map((response) => {
          const definition = this.document.dereference(response.$ref)
          if (definition instanceof ResponseDefinition) return definition

          return ResponseDefinition.unknown()
        })
        .filter((dep) => !ResponseDefinition.isUnknown(dep)),
    )
  }
}
