import { OpenAPIV3_1 } from '@scalar/openapi-types'
import { KeqQueryOptions } from 'keq'
import { Compiler } from '~/compiler/index.js'
import { QsArrayFormat } from '~/constants/qs-array-format.js'
import { Exception } from '~/exception.js'
import { ApiDocumentV3_1 } from '~/models/api-document_v3_1.js'
import { Plugin } from '~/types/plugin.js'
import { OpenapiUtils } from '~/utils/openapi-utils/index.js'


export type OverwriteQueryOptionsFactory = (
  (parameter: OpenAPIV3_1.ParameterObject) => KeqQueryOptions | undefined
) | KeqQueryOptions

const QsArrayFormatUnion: string[] = Object.values(QsArrayFormat)

export class OverwriteQueryOptionsPlugin implements Plugin {
  constructor(private readonly factory: OverwriteQueryOptionsFactory) {}

  apply(compiler: Compiler): void {
    compiler.hooks.afterDownload.tap(OverwriteQueryOptionsPlugin.name, (task) => {
      const documents = compiler.context.documents!
      const factory = this.factory

      compiler.context.documents = documents.map((document) => {
        const specification = OpenapiUtils.mapParameter(
          document.specification,
          (method, pathname, operation, parameter) => {
            const qsOptions = typeof factory === 'function' ? factory(parameter) : factory
            if (!qsOptions) return parameter

            if (qsOptions.arrayFormat) {
              if (!QsArrayFormatUnion.includes(qsOptions.arrayFormat)) {
                throw new Exception(document.module, `The 'arrayFormat' value '${qsOptions.arrayFormat}' for the query parameter '${parameter.name}' in [${method.toUpperCase()} ${pathname}] is invalid.`)
              }

              parameter['x-qs-array-format'] = qsOptions.arrayFormat
            }

            if (qsOptions.allowDots !== undefined) {
              if (typeof qsOptions.allowDots !== 'boolean') {
                throw new Exception(document.module, `The 'allowDots' value for the query parameter '${parameter.name}' in [${method.toUpperCase()} ${pathname}] must be a boolean.`)
              }

              parameter['x-qs-allow-dots'] = Boolean(qsOptions.allowDots)
            }

            if (qsOptions.indices !== undefined) {
              if (typeof qsOptions.indices !== 'boolean') {
                throw new Exception(document.module, `The 'indices' value for the query parameter '${parameter.name}' in [${method.toUpperCase()} ${pathname}] must be a boolean.`)
              }

              parameter['x-qs-indices'] = Boolean(qsOptions.indices)
            }

            return parameter
          },
        )

        return new ApiDocumentV3_1(
          specification,
          document.module,
        )
      })
    })
  }
}
