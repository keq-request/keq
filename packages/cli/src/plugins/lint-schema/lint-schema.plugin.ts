import Ajv2020 from 'ajv/dist/2020.js'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { Compiler } from '~/compiler/index.js'
import { Plugin } from '~/types/plugin.js'
import { logger } from '~/utils/logger.js'
import { SupportedMethods } from '~/constants/supported-methods.js'
import { ApiDocumentV3_1 } from '~/models/api-document_v3_1.js'
import { OpenapiUtils } from '~/utils/openapi-utils/index.js'
import { Exception } from '~/exception.js'


export interface LintSchemaPluginOptions {
  /**
   * When true, throw an error and stop the build if schema validation fails.
   * When false (default), log warnings and continue.
   * @default false
   */
  strict?: boolean
}

export class LintSchemaPlugin implements Plugin {
  constructor(private readonly options: LintSchemaPluginOptions = {}) {}

  apply(compiler: Compiler): void {
    compiler.hooks.beforeCompile.tap(LintSchemaPlugin.name, () => {
      const documents = compiler.context.documents!

      const ajv = new Ajv2020({ allErrors: true, strict: false })
      const validate = ajv.getSchema('https://json-schema.org/draft/2020-12/schema')

      if (!validate) {
        logger.warn('Failed to load JSON Schema Draft 2020-12 meta-schema for validation')
        return
      }

      let hasErrors = false

      for (const document of documents) {
        const spec = document.specification
        const moduleName = document.module.name

        // Validate components.schemas
        if (spec.components?.schemas) {
          for (const [name, schema] of Object.entries(spec.components.schemas)) {
            if (typeof schema === 'boolean' || '$ref' in schema) continue

            if (!validate(schema) && validate.errors) {
              hasErrors = true
              for (const error of validate.errors) {
                logger.warn(`[${moduleName}] components.schemas.${name}${error.instancePath}: ${error.message}`)
              }
            }
          }
        }

        // Validate operation schemas
        for (const [path, pathItem] of Object.entries(spec.paths || {})) {
          if (!pathItem) continue

          for (const method of SupportedMethods) {
            const operation = (pathItem as Record<string, OpenAPIV3_1.OperationObject>)[method]
            if (!operation) continue

            const operationId = operation.operationId || `${method.toUpperCase()} ${path}`

            // Parameters
            if (operation.parameters) {
              for (const param of operation.parameters) {
                if ('$ref' in param || !param.schema) continue
                if (typeof param.schema === 'boolean' || '$ref' in param.schema) continue

                if (!validate(param.schema) && validate.errors) {
                  hasErrors = true
                  for (const error of validate.errors) {
                    logger.warn(`[${moduleName}] ${operationId} parameter "${param.name}" schema${error.instancePath}: ${error.message}`)
                  }
                }
              }
            }

            // RequestBody
            if (operation.requestBody && !('$ref' in operation.requestBody)) {
              const content = (operation.requestBody.content || {}) as Record<string, OpenAPIV3_1.MediaTypeObject>
              for (const [mediaType, mediaTypeObj] of Object.entries(content)) {
                if (!mediaTypeObj.schema || typeof mediaTypeObj.schema === 'boolean' || '$ref' in mediaTypeObj.schema) continue

                if (!validate(mediaTypeObj.schema) && validate.errors) {
                  hasErrors = true
                  for (const error of validate.errors) {
                    logger.warn(`[${moduleName}] ${operationId} requestBody ${mediaType} schema${error.instancePath}: ${error.message}`)
                  }
                }
              }
            }

            // Responses
            if (operation.responses) {
              for (const [statusCode, response] of Object.entries(operation.responses)) {
                if ('$ref' in response) continue

                const content = (response.content || {}) as Record<string, OpenAPIV3_1.MediaTypeObject>
                for (const [mediaType, mediaTypeObj] of Object.entries(content)) {
                  if (!mediaTypeObj.schema || typeof mediaTypeObj.schema === 'boolean' || '$ref' in mediaTypeObj.schema) continue

                  if (!validate(mediaTypeObj.schema) && validate.errors) {
                    hasErrors = true
                    for (const error of validate.errors) {
                      logger.warn(`[${moduleName}] ${operationId} response ${statusCode} ${mediaType} schema${error.instancePath}: ${error.message}`)
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (this.options.strict && hasErrors) {
        throw new Error('Schema validation failed. Fix the errors above or set LintSchemaPlugin strict option to false.')
      }

      this.lintDuplicateOperationId(compiler, documents)
    })
  }

  /**
   * Detect duplicate operationId across all operations within each API document.
   *
   * In tolerant mode, duplicates are auto-resolved by appending `__{method}_{pathname}` suffix
   * and the patched document replaces the original in the compiler context.
   * In strict mode (tolerant=false), an Exception is thrown immediately.
   */
  private lintDuplicateOperationId(compiler: Compiler, documents: ApiDocumentV3_1[]): void {
    for (let i = 0; i < documents.length; i++) {
      const document = documents[i]
      const spec = document.specification
      const moduleName = document.module.name

      const operationIdMap = new Map<string, Array<{ method: string; pathname: string }>>()
      for (const [pathname, pathItem] of Object.entries(spec.paths || {})) {
        if (!pathItem) continue
        for (const method of SupportedMethods) {
          const operation = (pathItem as Record<string, OpenAPIV3_1.OperationObject>)[method]
          if (!operation?.operationId) continue
          const list = operationIdMap.get(operation.operationId) || []
          list.push({ method, pathname })
          operationIdMap.set(operation.operationId, list)
        }
      }

      const duplicates = [...operationIdMap.entries()].filter(([, ops]) => ops.length > 1)
      if (duplicates.length === 0) continue

      if (!compiler.options.tolerant) {
        const messages = duplicates.map(([id, ops]) => `  - operationId "${id}" is used by: ${ops.map((o) => `[${o.method.toUpperCase()} ${o.pathname}]`).join(', ')}`,
        )
        throw new Exception(document.module, `Duplicate operationId found:\n${messages.join('\n')}`)
      }

      const duplicateIds = new Set(duplicates.map(([id]) => id))
      for (const [id, ops] of duplicates) {
        logger.warn(`[${moduleName}] Duplicate operationId "${id}" found in: ${ops.map((o) => `[${o.method.toUpperCase()} ${o.pathname}]`).join(', ')}`)
      }

      const newSpec = OpenapiUtils.mapOperation(spec, (method, pathname, operation) => {
        if (operation.operationId && duplicateIds.has(operation.operationId)) {
          const sanitized = pathname
            .replace(/\//g, '_')
            .replace(/-/g, '_')
            .replace(/:/g, '$$')
            .replace(/{(.+)}/, '$$$1')
          const newId = `${operation.operationId}__${method}${sanitized}`
          logger.warn(`[${moduleName}] Renamed: "${operation.operationId}" -> "${newId}" for [${method.toUpperCase()} ${pathname}]`)
          operation.operationId = newId
        }
        return operation
      })

      compiler.context.documents![i] = new ApiDocumentV3_1(newSpec, document.module)
    }
  }
}
