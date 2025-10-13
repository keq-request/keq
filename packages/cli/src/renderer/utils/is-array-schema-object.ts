import type { OpenAPIV3_1 } from '@scalar/openapi-types'

export function isArraySchemaObject(schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject): schema is OpenAPIV3_1.ArraySchemaObject {
  return schema.type === 'array'
}
