import * as R from 'ramda'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { ModuleDefinition } from './module-definition.js'
import { JSONPath } from 'jsonpath-plus'
import { ApiDocumentV3_1 } from './api-document_v3_1.js'
import { SchemaDefinition } from './schema-definition.js'


export class ResponseDefinition {
  readonly name: string
  readonly response: OpenAPIV3_1.ResponseObject
  readonly module: ModuleDefinition
  readonly document: ApiDocumentV3_1

  get id(): string {
    return `${this.module.address.url}#/components/responses/${this.name}`
  }

  constructor(args: {
    name: string
    response: OpenAPIV3_1.ResponseObject
    module: ModuleDefinition
    document: ApiDocumentV3_1
  }) {
    this.module = args.module
    this.name = args.name
    this.response = args.response
    this.document = args.document
  }

  getDependencies(): SchemaDefinition[] {
    const refs: string[] = R.uniq(JSONPath({
      path: "$.content..schema..$['$ref']",
      json: this.response,
    }))

    return refs
      .filter((ref) => typeof ref === 'string' && !!ref.trim())
      .map((ref) => {
        const definition = this.document.dereference(ref)
        if (definition instanceof SchemaDefinition) return definition

        return SchemaDefinition.unknown()
      })
      .filter((dep) => dep.id !== this.id)
  }

  static unknown(): ResponseDefinition {
    return new ResponseDefinition({
      name: '',
      response: { description: '' },
      module: ModuleDefinition.unknown(),
      document: ApiDocumentV3_1.unknown(),
    })
  }

  static isUnknown(definition: ResponseDefinition): boolean {
    return definition.name === ''
  }
}
