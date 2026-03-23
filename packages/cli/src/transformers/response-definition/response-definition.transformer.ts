import * as R from 'ramda'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { ResponseDefinition } from '~/models/index.js'
import { SchemaDefinition } from '~/models/index.js'
import { JsonSchemaTransformer, ReferenceTransformer } from '../json-schema/index.js'


interface ResponseDefinitionDeclarationRendererOptions {
  esm?: boolean
  additionalPropertiesType?: 'unknown' | 'any'

  getDependentSchemaDefinitionFilepath: (schemaDefinition: SchemaDefinition) => string
}

export class ResponseDefinitionTransformer {
  static toDeclaration(responseDefinition: ResponseDefinition, options: ResponseDefinitionDeclarationRendererOptions): string {
    const hint = `Referenced from response definition "${responseDefinition.name}".`
    const referenceTransformer = (schema: OpenAPIV3_1.ReferenceObject): string => {
      if (!schema.$ref || !schema.$ref.startsWith('#')) {
        return ReferenceTransformer.toInvalidDeclaration(schema, hint)
      }

      if (!responseDefinition.document.isRefDefined(schema.$ref)) {
        return ReferenceTransformer.toNotFoundDeclaration(schema, hint)
      }

      return ReferenceTransformer.toDeclaration(schema, (name) => `${name}Schema`)
    }

    const dependencies = responseDefinition.getDependencies()
    let $dependencies = dependencies
      .filter((dep) => !SchemaDefinition.isUnknown(dep))
      .map((dep) => {
        const filepath = options.getDependentSchemaDefinitionFilepath(dep)
        return `import type { ${dep.name} as ${dep.name}Schema } from "${filepath}"`
      })
      .map((str) => str.replace(/ from "(\.\.?\/.+?)(\.ts|\.mts|\.cts|\.js|\.cjs|\.mjs)?"/, options.esm ? ' from "$1.js"' : ' from "$1"'))
      .join('\n')

    if ($dependencies) $dependencies += '\n'

    const $type = ResponseDefinitionTransformer.renderContentType(
      responseDefinition.response,
      { referenceTransformer, additionalPropertiesType: options.additionalPropertiesType },
    )

    return [
      '/* @anchor:file:start */',
      '',
      $dependencies,
      `export type ${responseDefinition.name} = ${$type}`,
      '',
      '/* @anchor:file:end */',
    ].filter(R.isNotNil).join('\n')
  }

  private static renderContentType(
    response: OpenAPIV3_1.ResponseObject,
    options: { referenceTransformer: (schema: OpenAPIV3_1.ReferenceObject) => string; additionalPropertiesType?: 'unknown' | 'any' },
  ): string {
    const content = response.content
    if (!content || R.isEmpty(content)) return 'void'

    const $types = Object.entries(content)
      .map(([mediaType, mediaTypeObject]) => {
        if (mediaType.includes('text/event-stream')) return 'ReadableStream<ServerSentEvent>'
        if (mediaType.includes('multipart/form-data')) return 'FormData'
        if (!mediaTypeObject.schema) return 'unknown'

        return JsonSchemaTransformer.toDeclaration(mediaTypeObject.schema, options)
      })

    return $types.join(' | ') || 'void'
  }
}
