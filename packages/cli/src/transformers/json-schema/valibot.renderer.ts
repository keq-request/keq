/* eslint-disable @typescript-eslint/no-unused-vars */

import * as R from 'ramda'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { MixedSchemaObject } from './types/mixed-schema-object.js'
import { JsonSchemaUtils } from '~/utils/json-schema-utils/index.js'
import { indent } from '~/utils/indent.js'
import { CommentRenderer } from './comment.renderer.js'
import { ReferenceTransformer } from './reference.transformer.js'
import { Renderer } from '../types/renderer.js'


export interface JsonSchemaValibotRendererOptions {
  referenceTransformer?: (schema: OpenAPIV3_1.ReferenceObject) => string
}

export class ValibotRenderer implements Renderer {
  constructor(
    private readonly schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
    private readonly options: JsonSchemaValibotRendererOptions = {},
  ) {
  }

  render(): string {
    return this.renderSchema(this.schema)
  }

  private renderSchema(schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject): string {
    if (typeof schema === 'boolean') return 'v.unknown()'

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

    return 'v.unknown()'
  }


  private renderMixed(schema: MixedSchemaObject): string {
    if (Array.isArray(schema.type)) {
      const schemas = schema.type
        .map((type): (OpenAPIV3_1.ArraySchemaObject | OpenAPIV3_1.NonArraySchemaObject) => ({ ...schema, type }))
        .map((schema) => this.renderSchema(schema))

      return `v.union([${schemas.join(', ')}])`
    }

    return 'v.unknown()'
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
      result = `v.tuple([${items}])`
    } else if (schema.items && typeof schema.items === 'object') {
      result = `v.array(${this.renderSchema(schema.items)})`
    } else {
      result = 'v.array(v.any())'
    }

    // Add array length constraints using pipe
    const constraints: string[] = []
    if (schema.minItems !== undefined) {
      constraints.push(`v.minLength(${schema.minItems})`)
    }
    if (schema.maxItems !== undefined) {
      constraints.push(`v.maxLength(${schema.maxItems})`)
    }

    if (constraints.length > 0) {
      result = `v.pipe(${result}, ${constraints.join(', ')})`
    }

    return result
  }


  private renderObject(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    if (
      (!schema.properties || R.isEmpty(schema.properties))
      && (!schema.additionalProperties || R.isEmpty(schema.additionalProperties))
    ) {
      return 'v.object({})'
    }

    const $properties = Object.entries(schema.properties || {})
      .map(([propertyName, propertySchema]) => {
        let $comment = new CommentRenderer(propertySchema).render()
        if ($comment) $comment += '\n'

        const $key = `"${propertyName}"`
        let $value = this.renderSchema(propertySchema)

        // Add v.optional() for non-required fields
        if (!schema.required?.includes(propertyName)) {
          $value = `v.optional(${$value})`
        }

        return indent(2, `${$comment}${$key}: ${$value},`)
      })

    let result = [
      'v.object({',
      ...$properties,
      '})',
    ].join('\n')

    // Handle additionalProperties - Valibot uses looseness
    if (schema.additionalProperties) {
      if (schema.additionalProperties === true) {
        // For loose objects, we need to wrap with v.looseObject
        result = result.replace('v.object({', 'v.looseObject({')
      } else {
        // For specific additional properties type, use v.record
        const $value = this.renderSchema(schema.additionalProperties)
        result = `v.intersect([${result}, v.record(v.string(), ${$value})])`
      }
    }

    return result
  }

  private renderOneOf(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    if (!schema.oneOf) return 'v.unknown()'

    const schemas = schema.oneOf.map((s) => this.renderSchema(s))
    return `v.union([${schemas.join(', ')}])`
  }

  private renderAnyOf(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    if (!schema.anyOf) return 'v.unknown()'

    const schemas = schema.anyOf.map((s) => this.renderSchema(s))
    return `v.union([${schemas.join(', ')}])`
  }

  private renderAllOf(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    if (!schema.allOf || schema.allOf.length === 0) return 'v.unknown()'

    const schemas = schema.allOf.map((s) => this.renderSchema(s))

    // Valibot uses v.intersect with an array of schemas
    return `v.intersect([${schemas.join(', ')}])`
  }

  private renderEnum(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    if (!schema.enum || schema.enum.length === 0) return 'v.unknown()'

    // For single value, use literal
    if (schema.enum.length === 1) {
      return `v.literal(${JSON.stringify(schema.enum[0])})`
    }

    // For multiple values of the same type, use v.picklist for strings or v.union of literals for mixed types
    const allStrings = schema.enum.every((v) => typeof v === 'string')

    if (allStrings) {
      const values = schema.enum.map((v) => JSON.stringify(v)).join(', ')
      return `v.picklist([${values}])`
    }

    // Mixed types: use union of literals
    const literals = schema.enum.map((v) => `v.literal(${JSON.stringify(v)})`)
    return `v.union([${literals.join(', ')}])`
  }

  private renderString(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    if (schema.contentMediaType === 'application/octet-stream') {
      return 'v.union([v.instance(Blob), v.instance(Buffer)])'
    }

    if (schema.format === 'binary') {
      return 'v.union([v.instance(Blob), v.instance(Buffer)])'
    }

    let result = 'v.string()'
    const constraints: string[] = []

    // Add format validations
    if (schema.format === 'email') {
      constraints.push('v.email()')
    } else if (schema.format === 'uri' || schema.format === 'url') {
      constraints.push('v.url()')
    } else if (schema.format === 'uuid') {
      constraints.push('v.uuid()')
    } else if (schema.format === 'date-time') {
      constraints.push('v.isoDateTime()')
    } else if (schema.format === 'date') {
      constraints.push('v.isoDate()')
    } else if (schema.format === 'time') {
      constraints.push('v.isoTime()')
    }

    // Add length constraints
    if (schema.minLength !== undefined) {
      constraints.push(`v.minLength(${schema.minLength})`)
    }
    if (schema.maxLength !== undefined) {
      constraints.push(`v.maxLength(${schema.maxLength})`)
    }

    // Add pattern validation
    if (schema.pattern) {
      const escapedPattern = schema.pattern.replace(/\\/g, '\\\\')
      constraints.push(`v.regex(/${escapedPattern}/)`)
    }

    if (constraints.length > 0) {
      result = `v.pipe(${result}, ${constraints.join(', ')})`
    }

    return result
  }

  private renderNumber(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    let result = 'v.number()'
    const constraints: string[] = []

    // Add numeric constraints
    if (schema.minimum !== undefined) {
      if (schema.exclusiveMinimum) {
        constraints.push(`v.minValue(${schema.minimum + Number.EPSILON})`)
      } else {
        constraints.push(`v.minValue(${schema.minimum})`)
      }
    }
    if (schema.maximum !== undefined) {
      if (schema.exclusiveMaximum) {
        constraints.push(`v.maxValue(${schema.maximum - Number.EPSILON})`)
      } else {
        constraints.push(`v.maxValue(${schema.maximum})`)
      }
    }

    // Add multipleOf constraint
    if (schema.multipleOf !== undefined) {
      constraints.push(`v.multipleOf(${schema.multipleOf})`)
    }

    if (constraints.length > 0) {
      result = `v.pipe(${result}, ${constraints.join(', ')})`
    }

    return result
  }

  private renderBoolean(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    return 'v.boolean()'
  }

  private renderNull(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    return 'v.null()'
  }

  private renderInteger(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    let result = 'v.number()'
    const constraints: string[] = ['v.integer()']

    // Add numeric constraints
    if (schema.minimum !== undefined) {
      if (schema.exclusiveMinimum) {
        constraints.push(`v.minValue(${schema.minimum + 1})`)
      } else {
        constraints.push(`v.minValue(${schema.minimum})`)
      }
    }
    if (schema.maximum !== undefined) {
      if (schema.exclusiveMaximum) {
        constraints.push(`v.maxValue(${schema.maximum - 1})`)
      } else {
        constraints.push(`v.maxValue(${schema.maximum})`)
      }
    }

    // Add multipleOf constraint
    if (schema.multipleOf !== undefined) {
      constraints.push(`v.multipleOf(${schema.multipleOf})`)
    }

    result = `v.pipe(${result}, ${constraints.join(', ')})`

    return result
  }
}
