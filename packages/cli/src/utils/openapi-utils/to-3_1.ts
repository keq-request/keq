import { upgrade } from '@scalar/openapi-parser'
import { OpenAPIV3_1 } from '@scalar/openapi-types'

export function To3_1(openapi: object): OpenAPIV3_1.Document {
  const { specification } = upgrade(openapi)
  return specification
}
