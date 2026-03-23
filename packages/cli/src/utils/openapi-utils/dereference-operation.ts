import * as R from 'ramda'
import jsonpointer from 'jsonpointer'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { JSONPath } from 'jsonpath-plus'
import { removeUndefinedRef } from './remove-undefined-ref.js'
import { dereference } from './dereference.js'


function dereferencePathObject(swagger: OpenAPIV3_1.Document): void {
  const matches = JSONPath({
    path: '$.paths.*.$ref^',
    json: swagger,
    resultType: 'all',
  })

  for (const match of matches) {
    const value = dereference(match.value.$ref, swagger)
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
    const value = dereference(match.value.$ref, swagger)
    jsonpointer.set(swagger, match.pointer, value)
  }
}

export function dereferenceResponses(swagger: OpenAPIV3_1.Document): void {
  const responseMatches = JSONPath({
    path: '$.paths.*.*.responses.*.$ref^',
    json: swagger,
    resultType: 'all',
  })

  // Only dereference response refs that do NOT point to #/components/responses/
  // Preserve response-level refs so they can be reused as shared types
  for (const match of responseMatches) {
    if (match.value.$ref && !match.value.$ref.startsWith('#/components/responses/')) {
      const value = dereference(match.value.$ref, swagger)
      jsonpointer.set(swagger, match.pointer, value)
    }
  }

  const headerMatches = JSONPath({
    path: '$.paths.*.*.responses.*.headers.*.$ref^',
    json: swagger,
    resultType: 'all',
  })

  for (const match of headerMatches) {
    const value = dereference(match.value.$ref, swagger)
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
    const value = dereference(match.value.$ref, swagger)
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
