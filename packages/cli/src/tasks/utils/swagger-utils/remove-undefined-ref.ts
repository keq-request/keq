import * as R from 'ramda'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { JSONPath } from 'jsonpath-plus'
import { isRefDefined } from './is-ref-defined.js'


// remove schema $ref if the reference is not founded
export function removeUndefinedRef(swagger: OpenAPIV3_1.Document): OpenAPIV3_1.Document {
  const shadow = R.clone(swagger)

  JSONPath({
    path: "$..*['$ref']",
    json: swagger,
    callback: (payload) => {
      if (payload.value && !isRefDefined(payload.value, swagger)) {
        delete payload.parent.$ref
      }
    },
  })

  return shadow
}
