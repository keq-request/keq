/* eslint-disable @typescript-eslint/no-unused-vars */

import * as R from 'ramda'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { MixedSchemaObject } from '../types/mixed-schema-object.js'
import { JsonSchemaUtils } from '~/utils/json-schema-utils/index.js'

export type Alias = (name: string) => string

export function generateComment(schema: OpenAPIV3_1.SchemaObject): string {
  const lines = ['/**']

  if (schema.description) {
    const description = schema.description.replace('*/', '*\\/')
    lines.push(...description.split('\n').map((line) => ` * ${line}`))
  }

  if (schema.deprecated) {
    lines.push(' * @deprecated')
  }

  if (schema.readOnly) {
    lines.push(' * @readonly')
  }

  if (schema.format) {
    lines.push(` * @format ${schema.format}`)
  }

  lines.push(' */')

  if (lines.length === 2) return ''
  return lines.join('\n')
}


export function generateSchema(schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject, alias: Alias = R.identity): string {
  if (typeof schema === 'boolean') return 'unknown'

  if (JsonSchemaUtils.isRef(schema)) return generateReference(schema, alias)
  if (JsonSchemaUtils.isMixed(schema)) return generateMixed(schema, alias)
  if (JsonSchemaUtils.isArray(schema)) return generateArray(schema, alias)

  if (schema.type === 'object') return generateObject(schema, alias)
  if (schema.enum) return generateEnum(schema, alias)
  if (schema.oneOf) return generateOneOf(schema, alias)
  if (schema.anyOf) return generateAnyOf(schema, alias)
  if (schema.allOf) return generateAllOf(schema, alias)
  if (schema.type === 'string') return generateString(schema, alias)
  if (schema.type === 'number') return generateNumber(schema, alias)
  if (schema.type === 'boolean') return generateBoolean(schema, alias)
  if (schema.type === 'null') return generateNull(schema, alias)
  if (schema.type === 'integer') return generateInteger(schema, alias)

  return 'unknown'
}

function generateMixed(schema: MixedSchemaObject, alias: Alias): string {
  if (Array.isArray(schema.type)) {
    schema.type
      .map((type): (OpenAPIV3_1.ArraySchemaObject | OpenAPIV3_1.NonArraySchemaObject) => ({ ...schema, type }))
      .map((schema) => generateSchema(schema, alias))
      .join(' | ')
  }

  return 'unknown'
}

function generateReference(schema: OpenAPIV3_1.ReferenceObject, alias: Alias): string {
  if (!schema.$ref || !schema.$ref.startsWith('#')) return `unknown /* ${schema.$ref.replace('*/', '*\\/')} */`

  const parts: string[] = schema.$ref.split('/')

  // TODO: 检查引用是否存在
  return alias(parts[parts.length - 1]) || 'unknown'
}


function generateArray(schema: OpenAPIV3_1.ArraySchemaObject, alias: Alias): string {
  if (schema.items && Array.isArray(schema.items)) {
    const items = schema.items.map((s) => generateSchema(s, alias)).join(', ')
    return `[${items}]`
  }

  if (schema.items && typeof schema.items === 'object') {
    return `${generateSchema(schema.items, alias)}[]`
  }

  return 'any[]'
}

export function indent(space: number, text: string): string {
  const indentation = ' '.repeat(space)
  return text.split('\n')
    .map((line) => `${indentation}${line}`)
    .join('\n')
}

function generateObject(schema: OpenAPIV3_1.NonArraySchemaObject, alias: Alias): string {
  if (
    (!schema.properties || R.isEmpty(schema.properties))
    && (!schema.additionalProperties || R.isEmpty(schema.additionalProperties))
  ) {
    return 'object'
  }

  const $properties = Object.entries(schema.properties || {})
    .map(([propertyName, propertySchema]) => {
      let $comment = generateComment(propertySchema)
      if ($comment) $comment += '\n'

      const $key = `"${propertyName}"${schema.required?.includes(propertyName) ? '' : '?'}`
      const $value = generateSchema(propertySchema, alias)

      return indent(2, `${$comment}${$key}: ${$value}`)
    })

  if (schema.additionalProperties) {
    const $value = schema.additionalProperties === true
      ? 'any'
      : generateSchema(schema.additionalProperties, alias)
    $properties.push(indent(2, `[key: string]: ${$value}`))
  }

  return [
    '{',
    ...$properties,
    '}',
  ].join('\n')
}

function generateOneOf(schema: OpenAPIV3_1.NonArraySchemaObject, alias: Alias): string {
  if (!schema.oneOf) return 'unknown'

  return schema.oneOf.map((s) => generateSchema(s, alias)).join(' | ')
}

function generateAnyOf(schema: OpenAPIV3_1.NonArraySchemaObject, alias: Alias): string {
  if (!schema.anyOf) return 'unknown'

  return schema.anyOf.map((s) => generateSchema(s, alias)).join(' | ')
}

function generateAllOf(schema: OpenAPIV3_1.NonArraySchemaObject, alias: Alias): string {
  if (!schema.allOf) return 'unknown'

  return schema.allOf.map((s) => generateSchema(s, alias)).join(' & ')
}

function generateEnum(schema: OpenAPIV3_1.NonArraySchemaObject, alias: Alias): string {
  if (!schema.enum) return 'unknown'
  return schema.enum.map((v) => JSON.stringify(v)).join(' | ')
}

function generateString(schema: OpenAPIV3_1.NonArraySchemaObject, alias: Alias): string {
  if (schema.contentMediaType === 'application/octet-stream') return 'Blob | Buffer'
  if (schema.format === 'binary') return 'Blob | Buffer'
  return 'string'
}

function generateNumber(schema: OpenAPIV3_1.NonArraySchemaObject, alias: Alias): string {
  return 'number'
}

function generateBoolean(schema: OpenAPIV3_1.NonArraySchemaObject, alias: Alias): string {
  return 'boolean'
}

function generateNull(schema: OpenAPIV3_1.NonArraySchemaObject, alias: Alias): string {
  return 'null'
}

function generateInteger(schema: OpenAPIV3_1.NonArraySchemaObject, alias: Alias): string {
  return 'number'
}
