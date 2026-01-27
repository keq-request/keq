
import { fixSwagger } from 'swagger-fix'
import { Compiler } from '~/compiler/index.js'
import { ApiDocumentV3_1 } from '~/models/index.js'
import { ChineseToPinyinPluginMetadata, MetadataStorage } from './constants/index.js'


export class ChineseToPinyinPlugin {
  apply(compiler: Compiler): void {
    // Prevent duplicate registration
    if (MetadataStorage.has(compiler)) return

    ChineseToPinyinPlugin.register(compiler)

    compiler.hooks.afterDownload.tap(ChineseToPinyinPlugin.name, (task) => {
      const documents = compiler.context.documents!

      compiler.context.documents = documents.map((doc) => {
        return new ApiDocumentV3_1(
          fixSwagger(doc.specification as any),
          doc.module,
        )
      })
    })
  }

  static register(compiler: Compiler): ChineseToPinyinPluginMetadata {
    if (!MetadataStorage.has(compiler)) {
      MetadataStorage.set(compiler, {
        hooks: { },
      })
    }
    return MetadataStorage.get(compiler)!
  }

  static of(compiler: Compiler): ChineseToPinyinPluginMetadata | undefined {
    return this.register(compiler)
  }
}
