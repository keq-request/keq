import * as R from 'ramda'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { ModuleDefinition } from './module-definition.js'
import { JSONPath } from 'jsonpath-plus'
import { ApiDocumentV3_1 } from './api-document_v3_1.js'


export class SchemaDefinition {
  readonly name: string
  readonly schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject
  readonly module: ModuleDefinition
  readonly document: ApiDocumentV3_1

  get id(): string {
    return `${this.module.address.url}#/components/schemas/${this.name}`
  }

  constructor(args: {
    name: string
    schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject
    module: ModuleDefinition
    document: ApiDocumentV3_1
  }) {
    this.module = args.module
    this.name = args.name
    this.schema = args.schema
    this.document = args.document
  }

  getDependencies(): SchemaDefinition[] {
    const refs: string[] = R.uniq(JSONPath({
      path: "$..*['$ref']",
      json: this.schema,
    }))

    return refs
      .filter((ref) => typeof ref === 'string' && !!ref.trim())
      .map((ref) => {
        const definition = this.document.dereference(ref)
        if (definition) return definition

        return SchemaDefinition.unknown()
      })
      .filter((dep) => dep.id !== this.id)
  }

  static unknown(): SchemaDefinition {
    return new SchemaDefinition({
      name: '',
      schema: {},
      module: ModuleDefinition.unknown(),
      document: ApiDocumentV3_1.unknown(),
    })
  }

  static isUnknown(definition: SchemaDefinition): boolean {
    return definition.name === ''
  }
}
