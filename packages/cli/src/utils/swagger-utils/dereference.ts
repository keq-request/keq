import type { OpenAPIV3_1 } from '@scalar/openapi-types'


export function dereference<T extends OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ResponseObject | OpenAPIV3_1.ParameterObject | OpenAPIV3_1.RequestBodyObject | OpenAPIV3_1.ReferenceObject>($ref: string, swagger: OpenAPIV3_1.Document): T {
  let value

  for (const key of $ref.split('/')) {
    if (key === '#') {
      value = swagger
    } else {
      value = value[key]
    }

    if (!value) break
  }

  return value as T
}
