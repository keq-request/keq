import { Compiler } from '~/compiler/compiler.js'
import { Plugin } from '~/types/plugin.js'
import { ESLint } from 'eslint'
import { EslintPluginMetadata, MetadataStorage } from './constants/index.js'


interface EslintPluginOptions {
  /**
   * List of ESLint rules to disable
   */
  disable?: string[]
}

export class EslintPlugin implements Plugin {
  constructor(private options: EslintPluginOptions = {}) {}


  apply(compiler: Compiler): void {
    if (!compiler.options.build) return

    // Prevent duplicate registration by checking applied flag
    const metadata = EslintPlugin.register(compiler)
    if (metadata.applied) return

    // Mark as applied immediately to prevent re-entry
    metadata.applied = true

    if (this.options.disable && this.options.disable.length > 0) {
      const $rules = [
        ...this.options.disable.map((rule) => `/* eslint-disable ${rule} */`),
      ].join('\n')

      compiler.hooks.afterCompile.tap(EslintPlugin.name, () => {
        const artifacts = compiler.context.artifacts || []

        for (const artifact of artifacts) {
          artifact.anchor.append('file:start', $rules)
        }
      })
    }

    compiler.hooks.afterPersist.tapPromise(EslintPlugin.name, async (task) => {
      const files = compiler.context.assets || []
      if (files.length === 0) return

      const eslint = new ESLint({ fix: true })
      const results = await eslint.lintFiles(files.map((file) => file.path))
      await ESLint.outputFixes(results)
    })
  }

  static register(compiler: Compiler): EslintPluginMetadata {
    if (!MetadataStorage.has(compiler)) {
      MetadataStorage.set(compiler, {
        applied: false,
        hooks: { },
      })
    }
    return MetadataStorage.get(compiler)!
  }

  static of(compiler: Compiler): EslintPluginMetadata | undefined {
    return this.register(compiler)
  }
}
