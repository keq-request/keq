import * as R from 'ramda'
import { Compiler } from '~/compiler/compiler.js'
import { Artifact, OperationDefinition } from '~/models/index.js'
import { Plugin } from '~/types/plugin.js'
import { JsonSchemaUtils } from '~/utils/json-schema-utils/index.js'
import { OpenAPIV3_1 } from '@scalar/openapi-types'

import { GenerateMicroFunctionPlugin } from '../generate-micro-function/index.js'
import { BodyFallbackPluginMetadata, MetadataStorage } from './constants/index.js'


export class BodyFallbackPlugin implements Plugin {
  apply(compiler: Compiler): void {
    // Prevent duplicate registration
    if (MetadataStorage.has(compiler)) return

    BodyFallbackPlugin.register(compiler)

    compiler.hooks.setup.tap(BodyFallbackPlugin.name, () => {
      const generateMicroFunctionPluginMetadata = GenerateMicroFunctionPlugin.of(compiler)

      if (!generateMicroFunctionPluginMetadata) {
        throw new Error('BodyFallbackPlugin requires GenerateMicroFunctionPlugin to be applied first.')
      }

      generateMicroFunctionPluginMetadata.hooks.afterMicroFunctionArtifactGenerated
        .tap(BodyFallbackPlugin.name, (artifact: Artifact, operationDefinition: OperationDefinition) => {
          const operation = operationDefinition.operation

          const parameters = operation.parameters?.filter((p): p is OpenAPIV3_1.ParameterObject => !JsonSchemaUtils.isRef(p)) || []
          const keys = parameters.map((p) => p.name).filter(R.isNotNil)

          const $acc = !keys.length
            ? '        acc[key] = args[key]'
            : [
              `        if (![${keys.map((k) => JSON.stringify(k)).join(', ')}].includes(key)) {`,
              '          acc[key] = args[key]',
              '        }',
            ].join('\n')

          artifact.anchor.block.replace('body', [
            // $mediaType ? `${$mediaType}\n` : undefined,
            '  if (typeof args === "object" && args !== null && !Array.isArray(args)) {',
            '    const requestBody = Object.keys(args)',
            '      .reduce((acc, key) => {',
            $acc,
            '        return acc',
            '      }, {} as Record<string, unknown>)',
            '',
            '    if (Object.keys(requestBody).length > 0) {',
            '      req.send(requestBody)',
            '    }',
            '  }',
          ].filter(R.isNotNil).join('\n'))

          return artifact
        })
    })
  }

  static register(compiler: Compiler): BodyFallbackPluginMetadata {
    if (!MetadataStorage.has(compiler)) {
      MetadataStorage.set(compiler, {
        hooks: { },
      })
    }
    return MetadataStorage.get(compiler)!
  }

  static of(compiler: Compiler): BodyFallbackPluginMetadata | undefined {
    return this.register(compiler)
  }
}
