import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { JsonSchemaUtils } from '~/utils/json-schema-utils/index.js'


const PARAMETER_AP_SCHEMAS: Record<string, OpenAPIV3_1.SchemaObject | undefined> = {
  query: {
    oneOf: [
      { type: 'string' },
      { type: 'number' },
      { type: 'integer' },
      { type: 'null' },
    ],
  },
  path: {
    oneOf: [
      { type: 'string' },
      { type: 'number' },
      { type: 'integer' },
      { type: 'boolean' },
      { type: 'null' },
    ],
  },
  header: {
    oneOf: [
      { type: 'string' },
      { type: 'number' },
      { type: 'integer' },
    ],
  },
}

/**
 * Recursively rewrite `additionalProperties` in object schemas for parameter types.
 * When additionalProperties is `true` or `undefined`, replace it with a keq-compatible schema
 * based on the parameter location (query/path/header).
 */
export function rewriteAdditionalPropertiesForParameter(
  schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
  parameterIn: string,
): OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject {
  if (JsonSchemaUtils.isRef(schema)) return schema
  if (typeof schema === 'boolean') return schema

  const replacement = PARAMETER_AP_SCHEMAS[parameterIn]
  if (!replacement) return schema

  const cloned = { ...schema }

  // Rewrite additionalProperties on object schemas
  if (cloned.type === 'object' || cloned.properties) {
    if (cloned.additionalProperties === true || cloned.additionalProperties === undefined) {
      cloned.additionalProperties = replacement
    } else if (typeof cloned.additionalProperties === 'object' && !JsonSchemaUtils.isRef(cloned.additionalProperties)) {
      cloned.additionalProperties = rewriteAdditionalPropertiesForParameter(cloned.additionalProperties, parameterIn) as OpenAPIV3_1.SchemaObject
    }
  }

  // Recursively handle nested properties
  if (cloned.properties) {
    cloned.properties = Object.fromEntries(
      Object.entries(cloned.properties).map(([key, value]) => [key, rewriteAdditionalPropertiesForParameter(value, parameterIn)]),
    )
  }

  // Recursively handle items
  if (cloned.items && typeof cloned.items === 'object' && !Array.isArray(cloned.items)) {
    cloned.items = rewriteAdditionalPropertiesForParameter(cloned.items, parameterIn) as OpenAPIV3_1.SchemaObject
  }

  // Recursively handle composition keywords
  for (const keyword of ['allOf', 'oneOf', 'anyOf'] as const) {
    if (cloned[keyword]) {
      cloned[keyword] = cloned[keyword].map((s) => rewriteAdditionalPropertiesForParameter(s, parameterIn))
    }
  }

  return cloned
}
