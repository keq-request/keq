import * as R from 'ramda'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { JSONPath } from 'jsonpath-plus'


export class JsonSchema {
  constructor(
    private value: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
  ) {}

  toJson(): OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject {
    return this.value
  }

  pickRefs(): string[] {
    const $refs: string[] = JSONPath({
      path: "$..*['$ref']",
      json: this.value,
    })
      .filter((ref) => typeof ref === 'string')

    return R.uniq($refs)
  }
}
