import { Plugin } from '~/types/index.js'
import { Compiler } from '~/compiler/index.js'
import { ApiDocumentV3_1, ModuleDefinition, OperationDefinition } from '~/models/index.js'
import { OpenAPIV3_1 } from '@scalar/openapi-types'
import { SupportedMethods } from '~/constants/index.js'
import { openapiShakingSync } from '@opendoc/openapi-shaking'
import { ShakingPluginMetadata, MetadataStorage } from './constants/index.js'

export class ShakingPlugin implements Plugin {
  apply(compiler: Compiler): void {
    const metadata = ShakingPlugin.register(compiler)
    if (metadata.applied) return

    // Mark as applied immediately to prevent re-entry
    metadata.applied = true

    compiler.hooks.beforeCompile.tap(ShakingPlugin.name, (task) => {
      const matcher = compiler.context.matcher!
      const documents = compiler.context.documents!

      compiler.context.documents = documents
        .map((document) => this.shaking(compiler, document))
        .filter((document) => !document.isEmpty())
        .filter((document) => !matcher.isModuleDenied(document.module))
    })
  }

  shaking(compiler: Compiler, document: ApiDocumentV3_1): ApiDocumentV3_1 {
    const rc = compiler.context.rc!
    const matcher = compiler.context.matcher!

    const isAccepted = (pathname: string, method: string, operation: OpenAPIV3_1.Document): boolean => {
      if (!SupportedMethods.includes(method)) return false

      return !matcher.isOperationDenied(new OperationDefinition({
        method,
        pathname,
        operation,
        module: document.module,
        document: document,
      }))
    }


    const sharkedSwagger = openapiShakingSync(
      document.specification as any,
      isAccepted as any,
      { tolerant: rc.tolerant },
    ) as OpenAPIV3_1.Document

    return new ApiDocumentV3_1(
      sharkedSwagger,
      new ModuleDefinition(
        document.module.name,
        {
          url: `memory://${document.module.name}.v3_1.sharked.json`,
          headers: {},
          encoding: 'utf8',
        },
      ),
    )
  }


  static register(compiler: Compiler): ShakingPluginMetadata {
    if (!MetadataStorage.has(compiler)) {
      MetadataStorage.set(compiler, {
        applied: false,
        hooks: {
        },
      })
    }
    return MetadataStorage.get(compiler)!
  }

  static of(compiler: Compiler): ShakingPluginMetadata | undefined {
    return this.register(compiler)
  }
}
