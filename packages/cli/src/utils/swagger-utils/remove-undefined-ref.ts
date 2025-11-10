import * as R from 'ramda'
import jsonpointer from 'jsonpointer'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { JSONPath } from 'jsonpath-plus'
import { isRefDefined } from './is-ref-defined.js'


// remove schema $ref if the reference is not founded
export function removeUndefinedRef(swagger: OpenAPIV3_1.Document): OpenAPIV3_1.Document {
  const shadow = R.clone(swagger)

  const matches = JSONPath({
    path: "$..*['$ref']^",
    json: swagger,
    resultType: 'all',
  })

  for (const match of matches) {
    if (match.value.$ref && !isRefDefined(match.value.$ref, swagger)) {
      jsonpointer.set(shadow, match.pointer, R.omit(['$ref'], match.value))
    }
  }

  return shadow
}
