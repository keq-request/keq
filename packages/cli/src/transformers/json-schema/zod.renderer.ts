/* eslint-disable @typescript-eslint/no-unused-vars */

import * as R from 'ramda'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { MixedSchemaObject } from './types/mixed-schema-object.js'
import { JsonSchemaUtils } from '~/utils/json-schema-utils/index.js'
import { indent } from '~/utils/indent.js'
import { CommentRenderer } from './comment.renderer.js'
import { ReferenceTransformer } from './reference.transformer.js'
import { Renderer } from '../types/renderer.js'


export interface JsonSchemaZodRendererOptions {
  referenceTransformer?: (schema: OpenAPIV3_1.ReferenceObject) => string
}

export class ZodRenderer implements Renderer {
  constructor(
    private readonly schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
    private readonly options: JsonSchemaZodRendererOptions = {},
  ) {
  }

  render(): string {
    return this.renderSchema(this.schema)
  }

  private renderSchema(schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject): string {
    if (typeof schema === 'boolean') return 'z.unknown()'

    if (JsonSchemaUtils.isRef(schema)) return this.renderReference(schema)
    if (JsonSchemaUtils.isMixed(schema)) return this.renderMixed(schema)
    if (JsonSchemaUtils.isArray(schema)) return this.renderArray(schema)

    if (schema.type === 'object') return this.renderObject(schema)
    if (schema.enum) return this.renderEnum(schema)
    if (schema.oneOf) return this.renderOneOf(schema)
    if (schema.anyOf) return this.renderAnyOf(schema)
    if (schema.allOf) return this.renderAllOf(schema)
    if (schema.type === 'string') return this.renderString(schema)
    if (schema.type === 'number') return this.renderNumber(schema)
    if (schema.type === 'boolean') return this.renderBoolean(schema)
    if (schema.type === 'null') return this.renderNull(schema)
    if (schema.type === 'integer') return this.renderInteger(schema)

    return 'z.unknown()'
  }


  private renderMixed(schema: MixedSchemaObject): string {
    if (Array.isArray(schema.type)) {
      const schemas = schema.type
        .map((type): (OpenAPIV3_1.ArraySchemaObject | OpenAPIV3_1.NonArraySchemaObject) => ({ ...schema, type }))
        .map((schema) => this.renderSchema(schema))

      return `z.union([${schemas.join(', ')}])`
    }

    return 'z.unknown()'
  }

  private renderReference(schema: OpenAPIV3_1.ReferenceObject): string {
    if (!this.options.referenceTransformer) {
      return ReferenceTransformer.toDeclaration(schema, (name) => `${name}Schema`)
    }

    return this.options.referenceTransformer(schema)
  }

  private renderArray(schema: OpenAPIV3_1.ArraySchemaObject): string {
    let result: string

    if (schema.items && Array.isArray(schema.items)) {
      const items = schema.items.map((s) => this.renderSchema(s)).join(', ')
      result = `z.tuple([${items}])`
    } else if (schema.items && typeof schema.items === 'object') {
      result = `z.array(${this.renderSchema(schema.items)})`
    } else {
      result = 'z.array(z.any())'
    }

    // Add array length constraints
    if (schema.minItems !== undefined && schema.maxItems !== undefined) {
      result += `.min(${schema.minItems}).max(${schema.maxItems})`
    } else if (schema.minItems !== undefined) {
      result += `.min(${schema.minItems})`
    } else if (schema.maxItems !== undefined) {
      result += `.max(${schema.maxItems})`
    }

    return result
  }


  private renderObject(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    if (
      (!schema.properties || R.isEmpty(schema.properties))
      && (!schema.additionalProperties || R.isEmpty(schema.additionalProperties))
    ) {
      return 'z.object({})'
    }

    const $properties = Object.entries(schema.properties || {})
      .map(([propertyName, propertySchema]) => {
        let $comment = new CommentRenderer(propertySchema).render()
        if ($comment) $comment += '\n'

        const $key = `"${propertyName}"`
        let $value = this.renderSchema(propertySchema)

        // Add .optional() for non-required fields
        if (!schema.required?.includes(propertyName)) {
          $value += '.optional()'
        }

        return indent(2, `${$comment}${$key}: ${$value},`)
      })

    let result = [
      'z.object({',
      ...$properties,
      '})',
    ].join('\n')

    // Handle additionalProperties
    if (schema.additionalProperties) {
      const $value = schema.additionalProperties === true
        ? 'z.any()'
        : this.renderSchema(schema.additionalProperties)
      result += `.catchall(${$value})`
    }

    return result
  }

  private renderOneOf(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    if (!schema.oneOf) return 'z.unknown()'

    const schemas = schema.oneOf.map((s) => this.renderSchema(s))
    return `z.union([${schemas.join(', ')}])`
  }

  private renderAnyOf(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    if (!schema.anyOf) return 'z.unknown()'

    const schemas = schema.anyOf.map((s) => this.renderSchema(s))
    return `z.union([${schemas.join(', ')}])`
  }

  private renderAllOf(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    if (!schema.allOf || schema.allOf.length === 0) return 'z.unknown()'

    const schemas = schema.allOf.map((s) => this.renderSchema(s))

    // If we have only one schema, return it directly
    if (schemas.length === 1) {
      return schemas[0]
    }

    // If we have two schemas, use z.intersection
    if (schemas.length === 2) {
      return `z.intersection(${schemas[0]}, ${schemas[1]})`
    }

    // For more than 2 schemas, chain intersections from left to right
    return schemas.reduce((acc, schema) => {
      return `z.intersection(${acc}, ${schema})`
    })
  }

  private renderEnum(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    if (!schema.enum || schema.enum.length === 0) return 'z.unknown()'

    // For single value, use literal
    if (schema.enum.length === 1) {
      return `z.literal(${JSON.stringify(schema.enum[0])})`
    }

    // For multiple values of the same type, use z.enum for strings or z.union of literals for mixed types
    const allStrings = schema.enum.every((v) => typeof v === 'string')

    if (allStrings) {
      const values = schema.enum.map((v) => JSON.stringify(v)).join(', ')
      return `z.enum([${values}])`
    }

    // Mixed types: use union of literals
    const literals = schema.enum.map((v) => `z.literal(${JSON.stringify(v)})`)
    return `z.union([${literals.join(', ')}])`
  }

  private renderString(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    if (schema.contentMediaType === 'application/octet-stream') {
      return 'z.union([z.instanceof(Blob), z.instanceof(Buffer)])'
    }

    if (schema.format === 'binary') {
      return 'z.union([z.instanceof(Blob), z.instanceof(Buffer)])'
    }

    let result = 'z.string()'

    // Add format validations
    if (schema.format === 'email') {
      result += '.email()'
    } else if (schema.format === 'uri' || schema.format === 'url') {
      result += '.url()'
    } else if (schema.format === 'uuid') {
      result += '.uuid()'
    } else if (schema.format === 'date-time') {
      result += '.datetime()'
    } else if (schema.format === 'date') {
      result += '.date()'
    } else if (schema.format === 'time') {
      result += '.time()'
    }

    // Add length constraints
    if (schema.minLength !== undefined && schema.maxLength !== undefined) {
      result += `.min(${schema.minLength}).max(${schema.maxLength})`
    } else if (schema.minLength !== undefined) {
      result += `.min(${schema.minLength})`
    } else if (schema.maxLength !== undefined) {
      result += `.max(${schema.maxLength})`
    }

    // Add pattern validation
    if (schema.pattern) {
      const escapedPattern = schema.pattern.replace(/\\/g, '\\\\')
      result += `.regex(/${escapedPattern}/)`
    }

    return result
  }

  private renderNumber(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    let result = 'z.number()'

    // Add numeric constraints
    if (schema.minimum !== undefined && schema.maximum !== undefined) {
      if (schema.exclusiveMinimum) {
        result += `.gt(${schema.minimum})`
      } else {
        result += `.gte(${schema.minimum})`
      }
      if (schema.exclusiveMaximum) {
        result += `.lt(${schema.maximum})`
      } else {
        result += `.lte(${schema.maximum})`
      }
    } else if (schema.minimum !== undefined) {
      if (schema.exclusiveMinimum) {
        result += `.gt(${schema.minimum})`
      } else {
        result += `.gte(${schema.minimum})`
      }
    } else if (schema.maximum !== undefined) {
      if (schema.exclusiveMaximum) {
        result += `.lt(${schema.maximum})`
      } else {
        result += `.lte(${schema.maximum})`
      }
    }

    // Add multipleOf constraint
    if (schema.multipleOf !== undefined) {
      result += `.multipleOf(${schema.multipleOf})`
    }

    return result
  }

  private renderBoolean(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    return 'z.boolean()'
  }

  private renderNull(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    return 'z.null()'
  }

  private renderInteger(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    let result = 'z.number().int()'

    // Add numeric constraints
    if (schema.minimum !== undefined && schema.maximum !== undefined) {
      if (schema.exclusiveMinimum) {
        result += `.gt(${schema.minimum})`
      } else {
        result += `.gte(${schema.minimum})`
      }
      if (schema.exclusiveMaximum) {
        result += `.lt(${schema.maximum})`
      } else {
        result += `.lte(${schema.maximum})`
      }
    } else if (schema.minimum !== undefined) {
      if (schema.exclusiveMinimum) {
        result += `.gt(${schema.minimum})`
      } else {
        result += `.gte(${schema.minimum})`
      }
    } else if (schema.maximum !== undefined) {
      if (schema.exclusiveMaximum) {
        result += `.lt(${schema.maximum})`
      } else {
        result += `.lte(${schema.maximum})`
      }
    }

    // Add multipleOf constraint
    if (schema.multipleOf !== undefined) {
      result += `.multipleOf(${schema.multipleOf})`
    }

    return result
  }
}
