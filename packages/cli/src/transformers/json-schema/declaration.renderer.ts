/* eslint-disable @typescript-eslint/no-unused-vars */

import * as R from 'ramda'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { MixedSchemaObject } from './types/mixed-schema-object.js'
import { JsonSchemaUtils } from '~/utils/json-schema-utils/index.js'
import { indent } from '~/utils/indent.js'
import { CommentRenderer } from './comment.renderer.js'
import { ReferenceTransformer } from './reference.transformer.js'
import { Renderer } from '../types/renderer.js'


export interface JsonSchemaDeclarationRendererOptions {
  /**
   * Custom renderer for `$ref` reference objects in TypeScript type declarations.
   *
   * When not provided, defaults to `ReferenceTransformer.toDeclaration`,
   * which converts the `$ref` path to a type name.
   *
   * @example
   * // Default behavior (without referenceTransformer):
   * // { $ref: '#/components/schemas/User' } → 'User'
   *
   * @example
   * // Custom transformer with alias mapping to avoid type name conflicts:
   * // Given aliases = { '#/components/schemas/User': 'UserV2' }
   * // { $ref: '#/components/schemas/User' } → 'UserV2'
   * const renderer = new DeclarationRenderer(schema, {
   *   referenceTransformer: (ref) => aliases.get(ref.$ref) ?? ReferenceTransformer.toDeclaration(ref),
   * })
   */
  referenceTransformer?: (schema: OpenAPIV3_1.ReferenceObject) => string

  /**
   * Controls how `additionalProperties: true` (or undefined) is rendered.
   * @default 'unknown'
   */
  additionalPropertiesType?: 'unknown' | 'any'
}

export class DeclarationRenderer implements Renderer {
  constructor(
    private readonly schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
    private readonly options: JsonSchemaDeclarationRendererOptions = {},
  ) {
  }

  render(): string {
    return this.renderSchema(this.schema)
  }

  private renderSchema(schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject): string {
    if (typeof schema === 'boolean') return 'unknown'

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

    return 'unknown'
  }


  private renderMixed(schema: MixedSchemaObject): string {
    if (Array.isArray(schema.type)) {
      schema.type
        .map((type): (OpenAPIV3_1.ArraySchemaObject | OpenAPIV3_1.NonArraySchemaObject) => ({ ...schema, type }))
        .map((schema) => this.renderSchema(schema))
        .join(' | ')
    }

    return 'unknown'
  }

  private renderReference(schema: OpenAPIV3_1.ReferenceObject): string {
    if (!this.options.referenceTransformer) {
      return ReferenceTransformer.toDeclaration(schema)
    }

    return this.options.referenceTransformer(schema)
  }

  private renderArray(schema: OpenAPIV3_1.ArraySchemaObject): string {
    if (schema.items && Array.isArray(schema.items)) {
      const items = schema.items.map((s) => this.renderSchema(s)).join(', ')
      return `[${items}]`
    }

    if (schema.items && typeof schema.items === 'object') {
      return `${this.renderSchema(schema.items)}[]`
    }

    return 'any[]'
  }


  private renderObject(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    const hasProperties = schema.properties && !R.isEmpty(schema.properties)

    const apType = this.options.additionalPropertiesType ?? 'unknown'

    // No named properties: produce Record<K, V> forms
    if (!hasProperties) {
      if (schema.additionalProperties === false) {
        return 'Record<string, never>'
      }

      if (typeof schema.additionalProperties === 'object') {
        return `Record<string, ${this.renderSchema(schema.additionalProperties)}>`
      }

      // additionalProperties true or undefined (implicit open object per OpenAPI 3.1 spec)
      return `Record<string, ${apType}>`
    }

    // Has named properties: render as object literal
    const $properties = Object.entries(schema.properties || {})
      .map(([propertyName, propertySchema]) => {
        let $comment = new CommentRenderer(propertySchema).render()
        if ($comment) $comment += '\n'

        const $key = `"${propertyName}"${schema.required?.includes(propertyName) ? '' : '?'}`
        const $value = this.renderSchema(propertySchema)

        return indent(2, `${$comment}${$key}: ${$value}`)
      })

    // Add index signature when additionalProperties is not false
    if (schema.additionalProperties !== false) {
      if (typeof schema.additionalProperties === 'object') {
        $properties.push(indent(2, `[key: string]: ${this.renderSchema(schema.additionalProperties)}`))
      } else {
        // additionalProperties true or undefined (implicit open object per OpenAPI 3.1 spec)
        $properties.push(indent(2, `[key: string]: ${apType}`))
      }
    }

    return [
      '{',
      ...$properties,
      '}',
    ].join('\n')
  }

  private renderOneOf(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    if (!schema.oneOf) return 'unknown'

    return schema.oneOf.map((s) => this.renderSchema(s)).join(' | ')
  }

  private renderAnyOf(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    if (!schema.anyOf) return 'unknown'

    return schema.anyOf.map((s) => this.renderSchema(s)).join(' | ')
  }

  private renderAllOf(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    if (!schema.allOf) return 'unknown'

    return schema.allOf.map((s) => this.renderSchema(s)).join(' & ')
  }

  private renderEnum(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    if (!schema.enum) return 'unknown'
    return schema.enum.map((v) => JSON.stringify(v)).join(' | ')
  }

  private renderString(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    if (schema.contentMediaType === 'application/octet-stream') return 'Blob | Buffer'
    if (schema.format === 'binary') return 'Blob | Buffer'
    return 'string'
  }

  private renderNumber(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    return 'number'
  }

  private renderBoolean(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    return 'boolean'
  }

  private renderNull(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    return 'null'
  }

  private renderInteger(schema: OpenAPIV3_1.NonArraySchemaObject): string {
    return 'number'
  }
}
