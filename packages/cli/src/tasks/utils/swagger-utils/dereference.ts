import type { OpenAPIV3_1 } from '@scalar/openapi-types'


export function dereference($ref: string, swagger: OpenAPIV3_1.Document): OpenAPIV3_1.Document {
  let value

  for (const key of $ref.split('/')) {
    if (key === '#') {
      value = swagger
    } else {
      value = value[key]
    }

    if (!value) break
  }

  return value
}
