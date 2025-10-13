/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { OpenAPIV3_1 } from '@scalar/openapi-types'
import { MixedSchemaObject } from '../types/mixed-schema-object'

export function isMixedSchemaObject(schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject): schema is MixedSchemaObject {
  return Array.isArray(schema.type)
}
