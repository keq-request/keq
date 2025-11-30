import { Compiler } from '~/compiler/compiler.js'
import { Plugin } from '~/types/plugin.js'
import { ESLint } from 'eslint'


interface EslintPluginOptions {
  /**
   * List of ESLint rules to disable
   */
  disable?: string[]
}

export class EslintPlugin implements Plugin {
  constructor(private options: EslintPluginOptions = {}) {}


  apply(compiler: Compiler): void {
    compiler.hooks.afterPersist.tapPromise(EslintPlugin.name, async (task) => {
      const files = compiler.context.persisted?.files || []
      if (files.length === 0) return

      const eslint = new ESLint({ fix: true })
      const results = await eslint.lintFiles(files.map((file) => file.path))
      await ESLint.outputFixes(results)
    })

    if (this.options.disable && this.options.disable.length > 0) {
      const $rules = [
        ...this.options.disable.map((rule) => `/* eslint-disable ${rule} */`),
      ].join('\n')

      compiler.hooks.afterCompileKeqRequest.tap(EslintPlugin.name, (artifact) => {
        artifact.anchor.append('file:start', $rules)
        return artifact
      })

      compiler.hooks.afterCompileOperationRequest.tap(EslintPlugin.name, (artifact) => {
        artifact.anchor.append('file:start', $rules)
        return artifact
      })

      compiler.hooks.afterCompileOperationType.tap(EslintPlugin.name, (artifact) => {
        artifact.anchor.append('file:start', $rules)
        return artifact
      })

      compiler.hooks.afterCompileSchema.tap(EslintPlugin.name, (artifact) => {
        artifact.anchor.append('file:start', $rules)
        return artifact
      })
    }
  }
}
