import * as R from 'ramda'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { SupportedMethods } from '~/constants/supported-methods.js'


/**
 * A function that transforms a single schema object.
 * Receives a non-`$ref` schema and returns the transformed schema.
 * The mapper does NOT need to handle recursion — `mapSchema` walks the tree automatically.
 */
export type SchemaMapper = (schema: OpenAPIV3_1.SchemaObject) => OpenAPIV3_1.SchemaObject

function walkSchema(
  schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | undefined,
  mapper: SchemaMapper,
): OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | undefined {
  if (!schema) return schema
  if (typeof schema === 'boolean') return schema
  if ('$ref' in schema) return schema

  let result: OpenAPIV3_1.NonArraySchemaObject | OpenAPIV3_1.ArraySchemaObject = mapper(schema) as OpenAPIV3_1.NonArraySchemaObject | OpenAPIV3_1.ArraySchemaObject

  // Recursively walk nested schemas
  if (result.properties) {
    const newProperties: Record<string, OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject> = {}
    for (const [key, value] of Object.entries(result.properties)) {
      newProperties[key] = walkSchema(value, mapper) as OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject
    }
    result = Object.assign({}, result, { properties: newProperties })
  }

  if (typeof result.additionalProperties === 'object' && result.additionalProperties !== null && !('$ref' in result.additionalProperties)) {
    result = Object.assign({}, result, { additionalProperties: walkSchema(result.additionalProperties, mapper) as OpenAPIV3_1.SchemaObject })
  }

  if ('items' in result && result.items && typeof result.items === 'object' && !Array.isArray(result.items)) {
    result = Object.assign({}, result, { items: walkSchema(result.items, mapper) })
  }

  for (const keyword of ['allOf', 'oneOf', 'anyOf'] as const) {
    if (result[keyword]) {
      result = Object.assign({}, result, { [keyword]: result[keyword].map((s) => walkSchema(s, mapper)) })
    }
  }

  return result
}

function walkMediaTypeSchemas(
  content: Record<string, OpenAPIV3_1.MediaTypeObject> | undefined,
  mapper: SchemaMapper,
): void {
  if (!content) return
  for (const mediaType of Object.values(content)) {
    if (mediaType.schema) {
      mediaType.schema = walkSchema(mediaType.schema, mapper) as OpenAPIV3_1.SchemaObject
    }
  }
}

/**
 * Recursively walk and transform every non-`$ref` schema in an OpenAPI 3.1 document.
 *
 * Returns a **deep clone** of the document — the original is never mutated.
 * The `mapper` is called on each `SchemaObject` (skipping `$ref` and `boolean` schemas),
 * and then `mapSchema` continues into the mapper's return value to process nested schemas
 * (`properties`, `additionalProperties`, `items`, `allOf`/`oneOf`/`anyOf`).
 *
 * Traversal covers:
 * - `components.schemas`
 * - Inline schemas in operation parameters, request bodies, and responses
 *
 * @example
 * // Set `additionalProperties: false` on every object schema that doesn't define it
 * const patched = mapSchema(doc, (schema) => {
 *   if ((schema.type === 'object' || schema.properties) && schema.additionalProperties === undefined) {
 *     return Object.assign({}, schema, { additionalProperties: false })
 *   }
 *   return schema
 * })
 *
 * @example
 * // Add a `description` fallback to all string schemas
 * const annotated = mapSchema(doc, (schema) => {
 *   if (schema.type === 'string' && !schema.description) {
 *     return Object.assign({}, schema, { description: 'No description provided' })
 *   }
 *   return schema
 * })
 */
export function mapSchema(specification: OpenAPIV3_1.Document, mapper: SchemaMapper): OpenAPIV3_1.Document {
  const shadow = R.clone(specification)

  // Walk components.schemas
  if (shadow.components?.schemas) {
    for (const [name, schema] of Object.entries(shadow.components.schemas)) {
      shadow.components.schemas[name] = walkSchema(schema, mapper) as OpenAPIV3_1.SchemaObject
    }
  }

  // Walk operations: parameters, requestBody, responses
  for (const [, pathItem] of Object.entries(shadow.paths || {})) {
    for (const m in pathItem) {
      const method = m.toLowerCase()
      if (!SupportedMethods.includes(method)) continue
      if (typeof pathItem[m] !== 'object' || Array.isArray(pathItem[m]) || pathItem[m] === null) continue

      const operation: OpenAPIV3_1.OperationObject = pathItem[m]

      // Walk parameter schemas
      if (operation.parameters) {
        for (const param of operation.parameters) {
          if ('$ref' in param) continue
          if (param.schema) {
            param.schema = walkSchema(param.schema, mapper) as OpenAPIV3_1.SchemaObject
          }
        }
      }

      // Walk request body schemas
      if (operation.requestBody && !('$ref' in operation.requestBody)) {
        walkMediaTypeSchemas(operation.requestBody.content, mapper)
      }

      // Walk response schemas
      if (operation.responses) {
        for (const response of Object.values(operation.responses)) {
          if ('$ref' in response) continue
          walkMediaTypeSchemas(response.content, mapper)
        }
      }
    }
  }

  return shadow
}
