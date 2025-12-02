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
    if (!compiler.options.build) return

    if (this.options.disable && this.options.disable.length > 0) {
      const $rules = [
        ...this.options.disable.map((rule) => `/* eslint-disable ${rule} */`),
      ].join('\n')

      compiler.hooks.afterCompile.tap(EslintPlugin.name, () => {
        const artifacts = compiler.context.compiled?.artifacts || []

        for (const artifact of artifacts) {
          artifact.anchor.append('file:start', $rules)
        }
      })
    }

    compiler.hooks.afterPersist.tapPromise(EslintPlugin.name, async (task) => {
      const files = compiler.context.persisted?.files || []
      if (files.length === 0) return

      const eslint = new ESLint({ fix: true })
      const results = await eslint.lintFiles(files.map((file) => file.path))
      await ESLint.outputFixes(results)
    })
  }
}
