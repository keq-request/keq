import * as R from 'ramda'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { ModuleDefinition } from './module-definition.js'
import { JSONPath } from 'jsonpath-plus'
import { ApiDocumentV3_1 } from './api-document_v3_1.js'


export class SchemaDefinition {
  readonly id: string
  readonly name: string
  readonly schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject
  readonly module: ModuleDefinition
  readonly document: ApiDocumentV3_1

  constructor(args: {
    id: string
    name: string
    schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject
    module: ModuleDefinition
    document: ApiDocumentV3_1
  }) {
    this.module = args.module
    this.name = args.name
    this.id = args.id
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

        return new SchemaDefinition({
          id: ref,
          name: 'unknown',
          schema: {},
          module: this.module,
          document: this.document,
        })
      })
  }
}
