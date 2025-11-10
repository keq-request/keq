import * as R from 'ramda'
import jsonpointer from 'jsonpointer'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { JSONPath } from 'jsonpath-plus'
import { removeUndefinedRef } from './remove-undefined-ref.js'
import { SwaggerUtils } from './index.js'


function dereferencePathObject(swagger: OpenAPIV3_1.Document): void {
  const matches = JSONPath({
    path: '$.paths.*.$ref^',
    json: swagger,
    resultType: 'all',
  })

  for (const match of matches) {
    const value = SwaggerUtils.dereference(match.value.$ref, swagger)
    jsonpointer.set(swagger, match.pointer, value)
  }
}

function dereferenceRequestBody(swagger: OpenAPIV3_1.Document): void {
  const matches = JSONPath({
    path: '$.paths.*.*.requestBody.$ref^',
    json: swagger,
    resultType: 'all',
  })

  for (const match of matches) {
    const value = SwaggerUtils.dereference(match.value.$ref, swagger)
    jsonpointer.set(swagger, match.pointer, value)
  }
}

export function dereferenceResponses(swagger: OpenAPIV3_1.Document): void {
  const matches = [
    ...JSONPath({
      path: '$.paths.*.*.responses.*.$ref^',
      json: swagger,
      resultType: 'all',
    }),
    ...JSONPath({
      path: '$.paths.*.*.responses.*.headers.*.$ref^',
      json: swagger,
      resultType: 'all',
    }),
  ]

  for (const match of matches) {
    const value = SwaggerUtils.dereference(match.value.$ref, swagger)
    jsonpointer.set(swagger, match.pointer, value)
  }
}

function dereferenceParameters(swagger: OpenAPIV3_1.Document): void {
  const matches = JSONPath({
    path: '$.paths.*.*.parameters.*.$ref^',
    json: swagger,
    resultType: 'all',
  })

  for (const match of matches) {
    const value = SwaggerUtils.dereference(match.value.$ref, swagger)
    jsonpointer.set(swagger, match.pointer, value)
  }
}

export function dereferenceOperation(swagger: OpenAPIV3_1.Document): OpenAPIV3_1.Document {
  const shadow = R.clone(swagger)

  dereferencePathObject(shadow)
  dereferenceRequestBody(shadow)
  dereferenceResponses(shadow)
  dereferenceParameters(shadow)

  return removeUndefinedRef(shadow)
}
