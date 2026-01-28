import * as R from 'ramda'
import { SchemaDefinition } from '~/models/index.js'
import { JsonSchemaUtils } from '~/utils/json-schema-utils/index.js'
import { JsonSchemaTransformer } from '../json-schema/index.js'


interface SchemaDefinitionDeclarationRendererOptions {
  esm?: boolean

  getDependentSchemaDefinitionFilepath: (schemaDefinition: SchemaDefinition) => string
}

interface SchemaDefinitionValibotRendererOptions {
  esm?: boolean

  getDependentSchemaDefinitionFilepath: (schemaDefinition: SchemaDefinition) => string
}

export class SchemaDefinitionTransformer {
  static toDeclaration(schemaDefinition: SchemaDefinition, options: SchemaDefinitionDeclarationRendererOptions): string {
    const dependencies = schemaDefinition.getDependencies()
    let $dependencies = dependencies
      .filter((dep) => !SchemaDefinition.isUnknown(dep))
      .map((dep) => {
        const filepath = options.getDependentSchemaDefinitionFilepath(dep)
        return `import type { ${dep.name} } from "${filepath}"`
      })
      .map((str) => str.replace(/ from "(\.\.?\/.+?)(\.ts|\.mts|\.cts|\.js|\.cjs|\.mjs)?"/, options.esm ? ' from "$1.js"' : ' from "$1"'))
      .join('\n')

    if ($dependencies) $dependencies += '\n'

    let $comment = JsonSchemaTransformer.toComment(schemaDefinition.schema)
    if ($comment) $comment += '\n'

    if (typeof schemaDefinition.schema === 'boolean') {
      return [
        '/* @anchor:file:start */',
        '',
        $dependencies,
        $comment || undefined,
        `type ${schemaDefinition.name} = unknown`,
        '',
        '/* @anchor:file:end */',
      ].filter(R.isNotNil).join('\n')
    }

    if (JsonSchemaUtils.isNonArray(schemaDefinition.schema) && schemaDefinition.schema.type === 'object') {
      const $schema = JsonSchemaTransformer.toDeclaration(schemaDefinition.schema)

      const $declaration = $schema.startsWith('{')
        ? `export interface ${schemaDefinition.name} ${$schema}`
        : `export type ${schemaDefinition.name} = ${$schema}`

      return [
        '/* @anchor:file:start */',
        '',
        $dependencies,
        $comment || undefined,
        $declaration,
        '',
        '/* @anchor:file:end */',
      ].filter(R.isNotNil).join('\n')
    }

    return [
      '/* @anchor:file:start */',
      '',
      $dependencies,
      $comment || undefined,
      `export type ${schemaDefinition.name} = ${JsonSchemaTransformer.toDeclaration(schemaDefinition.schema)}`,
      '',
      '/* @anchor:file:end */',
    ].filter(R.isNotNil).join('\n')
  }

  static toValibot(schemaDefinition: SchemaDefinition, options: SchemaDefinitionValibotRendererOptions): string {
    const dependencies = schemaDefinition.getDependencies()
    let $dependencies = dependencies
      .filter((dep) => !SchemaDefinition.isUnknown(dep))
      .map((dep) => {
        const filepath = options.getDependentSchemaDefinitionFilepath(dep)
        return `import { ${dep.name}, ${dep.name}Schema } from "${filepath}"`
      })
      .map((str) => str.replace(/ from "(\.\.?\/.+?)(\.ts|\.mts|\.cts|\.js|\.cjs|\.mjs)?"/, options.esm ? ' from "$1.js"' : ' from "$1"'))
      .join('\n')

    if ($dependencies) $dependencies += '\n'

    let $comment = JsonSchemaTransformer.toComment(schemaDefinition.schema)
    if ($comment) $comment += '\n'

    // Add valibot import
    const $valibotImport = 'import * as v from \'valibot\'\n'

    if (typeof schemaDefinition.schema === 'boolean') {
      return [
        '/* @anchor:file:start */',
        '',
        $valibotImport,
        $dependencies,
        $comment || undefined,
        `export const ${schemaDefinition.name}Schema = v.unknown()`,
        `export type ${schemaDefinition.name} = v.InferOutput<typeof ${schemaDefinition.name}Schema>`,
        '',
        '/* @anchor:file:end */',
      ].filter(R.isNotNil).join('\n')
    }

    const $schema = JsonSchemaTransformer.toValibot(schemaDefinition.schema)

    return [
      '/* @anchor:file:start */',
      '',
      $valibotImport,
      $dependencies,
      $comment || undefined,
      `export const ${schemaDefinition.name}Schema = ${$schema}`,
      `export type ${schemaDefinition.name} = v.InferOutput<typeof ${schemaDefinition.name}Schema>`,
      '',
      '/* @anchor:file:end */',
    ].filter(R.isNotNil).join('\n')
  }
}
