import { Compiler } from '~/compiler/index.js'
import { ApiDocumentV3_1 } from '~/models/index.js'
import { Plugin } from '~/types/plugin.js'
import { OpenapiUtils } from '~/utils/openapi-utils/index.js'
import { OverwriteAdditionalPropertiesPluginMetadata, MetadataStorage } from './constants/index.js'


export interface OverwriteAdditionalPropertiesPluginOptions {
  /**
   * When `true`, schemas without explicit `additionalProperties`
   * will be set to `additionalProperties: false`.
   * When `false` (default), respect OpenAPI 3.1 spec behavior
   * (undefined additionalProperties = true).
   * @default false
   */
  disallowIfNotPresent?: boolean
}

export class OverwriteAdditionalPropertiesPlugin implements Plugin {
  constructor(private readonly options: OverwriteAdditionalPropertiesPluginOptions = {}) {}

  apply(compiler: Compiler): void {
    const metadata = OverwriteAdditionalPropertiesPlugin.register(compiler)
    if (metadata.applied) return

    metadata.applied = true

    const { disallowIfNotPresent = false } = this.options

    if (!disallowIfNotPresent) return

    compiler.hooks.afterDownload.tap(OverwriteAdditionalPropertiesPlugin.name, () => {
      const documents = compiler.context.documents!

      compiler.context.documents = documents.map((document) => {
        const specification = OpenapiUtils.mapSchema(
          document.specification,
          (schema) => {
            if (schema.type !== 'object' && !schema.properties) return schema

            if (schema.additionalProperties === undefined) {
              return Object.assign({}, schema, { additionalProperties: false as const })
            }

            return schema
          },
        )

        return new ApiDocumentV3_1(
          specification,
          document.module,
        )
      })
    })
  }

  static register(compiler: Compiler): OverwriteAdditionalPropertiesPluginMetadata {
    if (!MetadataStorage.has(compiler)) {
      MetadataStorage.set(compiler, {
        applied: false,
      })
    }
    return MetadataStorage.get(compiler)!
  }

  static of(compiler: Compiler): OverwriteAdditionalPropertiesPluginMetadata | undefined {
    return this.register(compiler)
  }
}
