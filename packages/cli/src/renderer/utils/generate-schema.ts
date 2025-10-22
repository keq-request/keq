/* eslint-disable @typescript-eslint/no-unused-vars */

import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { isReferenceObject } from './is-reference-object.js'
import { isMixedSchemaObject } from './is-mixed-schema-object.js'
import { isArraySchemaObject } from './is-array-schema-object.js'
import { MixedSchemaObject } from '../types/mixed-schema-object.js'


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


export function generateSchema(schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject): string {
  if (typeof schema === 'boolean') return 'unknown'

  if (isReferenceObject(schema)) return generateReference(schema)
  if (isMixedSchemaObject(schema)) return generateMixed(schema)
  if (isArraySchemaObject(schema)) return generateArray(schema)

  if (schema.type === 'object') return generateObject(schema)
  if (schema.enum) return generateEnum(schema)
  if (schema.oneOf) return generateOneOf(schema)
  if (schema.anyOf) return generateAnyOf(schema)
  if (schema.allOf) return generateAllOf(schema)
  if (schema.type === 'string') return generateString(schema)
  if (schema.type === 'number') return generateNumber(schema)
  if (schema.type === 'boolean') return generateBoolean(schema)
  if (schema.type === 'null') return generateNull(schema)
  if (schema.type === 'integer') return generateInteger(schema)

  return 'unknown'
}

function generateMixed(schema: MixedSchemaObject): string {
  if (Array.isArray(schema.type)) {
    schema.type
      .map((type): (OpenAPIV3_1.ArraySchemaObject | OpenAPIV3_1.NonArraySchemaObject) => ({ ...schema, type }))
      .map((schema) => generateSchema(schema))
      .join(' | ')
  }

  return 'unknown'
}

function generateReference(schema: OpenAPIV3_1.ReferenceObject): string {
  if (!schema.$ref || !schema.$ref.startsWith('#')) return `unknown /* ${schema.$ref.replace('*/', '*\\/')} */`

  const parts = schema.$ref.split('/')

  // TODO: 检查引用是否存在
  return parts[parts.length - 1] || 'unknown'
}


function generateArray(schema: OpenAPIV3_1.ArraySchemaObject): string {
  if (schema.items && Array.isArray(schema.items)) {
    const items = schema.items.map((s) => generateSchema(s)).join(', ')
    return `[${items}]`
  }

  if (schema.items && typeof schema.items === 'object') {
    return `${generateSchema(schema.items)}[]`
  }

  return 'any[]'
}

export function indent(space: number, text: string): string {
  const indentation = ' '.repeat(space)
  return text.split('\n')
    .map((line) => `${indentation}${line}`)
    .join('\n')
}

function generateObject(schema: OpenAPIV3_1.NonArraySchemaObject): string {
  if (!schema.properties || !Object.keys(schema.properties).length) {
    return 'object'
  }

  const $properties = Object.entries(schema.properties || {})
    .map(([propertyName, propertySchema]) => {
      let $comment = generateComment(propertySchema)
      if ($comment) $comment += '\n'

      const $key = `"${propertyName}"${schema.required?.includes(propertyName) ? '' : '?'}`
      const $value = generateSchema(propertySchema)

      return indent(2, `${$comment}${$key}: ${$value}`)
    })

  if (schema.additionalProperties) {
    const $value = schema.additionalProperties === true ? 'any' : generateSchema(schema.additionalProperties)
    $properties.push(indent(2, `[key: string]: ${$value}`))
  }

  return [
    '{',
    ...$properties,
    '}',
  ].join('\n')
}

function generateOneOf(schema: OpenAPIV3_1.NonArraySchemaObject): string {
  if (!schema.oneOf) return 'unknown'

  return schema.oneOf.map((s) => generateSchema(s)).join(' | ')
}

function generateAnyOf(schema: OpenAPIV3_1.NonArraySchemaObject): string {
  if (!schema.anyOf) return 'unknown'

  return schema.anyOf.map((s) => generateSchema(s)).join(' | ')
}

function generateAllOf(schema: OpenAPIV3_1.NonArraySchemaObject): string {
  if (!schema.allOf) return 'unknown'

  return schema.allOf.map((s) => generateSchema(s)).join(' & ')
}

function generateEnum(schema: OpenAPIV3_1.NonArraySchemaObject): string {
  if (!schema.enum) return 'unknown'
  return schema.enum.map((v) => JSON.stringify(v)).join(' | ')
}

function generateString(schema: OpenAPIV3_1.NonArraySchemaObject): string {
  if (schema.format === 'binary') return 'Blob | Buffer'
  return 'string'
}

function generateNumber(schema: OpenAPIV3_1.NonArraySchemaObject): string {
  return 'number'
}

function generateBoolean(schema: OpenAPIV3_1.NonArraySchemaObject): string {
  return 'boolean'
}

function generateNull(schema: OpenAPIV3_1.NonArraySchemaObject): string {
  return 'null'
}

function generateInteger(schema: OpenAPIV3_1.NonArraySchemaObject): string {
  return 'number'
}
