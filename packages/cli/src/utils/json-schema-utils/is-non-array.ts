import type { OpenAPIV3_1 } from '@scalar/openapi-types'

export function isNonArray(schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject): schema is OpenAPIV3_1.NonArraySchemaObject {
  return typeof schema.type === 'string' && schema.type !== 'array'
}
