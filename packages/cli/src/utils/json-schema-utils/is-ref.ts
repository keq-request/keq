import type { OpenAPIV3_1 } from '@scalar/openapi-types'


export function isRef(schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.ResponseObject | OpenAPIV3_1.ParameterObject): schema is OpenAPIV3_1.ReferenceObject {
  return '$ref' in schema
}
