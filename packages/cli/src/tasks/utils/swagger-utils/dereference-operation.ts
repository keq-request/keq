import * as R from 'ramda'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { JSONPath } from 'jsonpath-plus'
import { removeUndefinedRef } from './remove-undefined-ref.js'
import { SwaggerUtils } from './index.js'


function dereferencePathObject(swagger: OpenAPIV3_1.Document): void {
  JSONPath({
    path: '$.paths.*.$ref',
    json: swagger,
    callback: (payload) => {
      const value = SwaggerUtils.dereference(payload.value, swagger)
      delete payload.parent.$ref
      Object.assign(payload.parent, value)
    },
  })
}

function dereferenceRequestBody(swagger: OpenAPIV3_1.Document): void {
  JSONPath({
    path: '$.paths.*.*.requestBody.$ref',
    json: swagger,
    callback: (payload) => {
      const value = SwaggerUtils.dereference(payload.value, swagger)
      delete payload.parent.$ref
      Object.assign(payload.parent, value)
    },
  })
}

export function dereferenceResponses(swagger: OpenAPIV3_1.Document): void {
  JSONPath({
    path: '$.paths.*.*.responses.*.$ref',
    json: swagger,
    callback: (payload) => {
      const value = SwaggerUtils.dereference(payload.value, swagger)
      delete payload.parent.$ref
      Object.assign(payload.parent, value)
    },
  })

  JSONPath({
    path: '$.paths.*.*.responses.*.headers.*.$ref',
    json: swagger,
    callback: (payload) => {
      const value = SwaggerUtils.dereference(payload.value, swagger)
      delete payload.parent.$ref
      Object.assign(payload.parent, value)
    },
  })
}

function dereferenceParameters(swagger: OpenAPIV3_1.Document): void {
  JSONPath({
    path: '$.paths.*.*.parameters.*.$ref',
    json: swagger,
    callback: (payload) => {
      const value = SwaggerUtils.dereference(payload.value, swagger)
      delete payload.parent.$ref
      Object.assign(payload.parent, value)
    },
  })
}

export function dereferenceOperation(swagger: OpenAPIV3_1.Document): OpenAPIV3_1.Document {
  const shadow = R.clone(swagger)

  dereferencePathObject(shadow)
  dereferenceRequestBody(shadow)
  dereferenceResponses(shadow)
  dereferenceParameters(shadow)

  return removeUndefinedRef(shadow)
}
