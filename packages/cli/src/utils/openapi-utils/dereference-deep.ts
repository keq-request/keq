import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { dereference } from './dereference.js'
import { JsonSchemaUtils } from '../json-schema-utils/index.js'


export function dereferenceDeep<T extends OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ResponseObject | OpenAPIV3_1.ParameterObject | OpenAPIV3_1.RequestBodyObject>($ref: string, swagger: OpenAPIV3_1.Document): T {
  const stack = [$ref]
  let value

  while (true) {
    const last = stack[stack.length - 1]
    value = dereference(last, swagger)

    if (JsonSchemaUtils.isRef(value)) {
      if (!stack.includes(value.$ref)) {
        stack.push(value.$ref)
        continue
      } else {
        // Circular reference detected
        throw new Error(`Circular reference detected: ${stack.join(' -> ')} -> ${value.$ref}`)
      }
    }

    break
  }

  return value as T
}
