
import { fixSwagger } from 'swagger-fix'
import { Compiler } from '~/compiler/index.js'
import { ChineseToPinyinPluginMetadata, MetadataStorage } from './constants/index.js'


export class ChineseToPinyinPlugin {
  apply(compiler: Compiler): void {
    const metadata = ChineseToPinyinPlugin.register(compiler)
    if (metadata.applied) return

    metadata.applied = true

    compiler.hooks.beforeValidate.tap(ChineseToPinyinPlugin.name, (spec) => {
      const fixed = fixSwagger(spec as any)
      for (const key of Object.keys(spec as any)) {
        delete (spec as any)[key]
      }
      Object.assign(spec, fixed)
    })
  }

  static register(compiler: Compiler): ChineseToPinyinPluginMetadata {
    if (!MetadataStorage.has(compiler)) {
      MetadataStorage.set(compiler, {
        applied: false,
        hooks: { },
      })
    }
    return MetadataStorage.get(compiler)!
  }

  static of(compiler: Compiler): ChineseToPinyinPluginMetadata | undefined {
    return this.register(compiler)
  }
}
