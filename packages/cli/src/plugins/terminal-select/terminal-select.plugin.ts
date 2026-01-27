import { Compiler } from '~/compiler/index.js'
import { Plugin } from '~/types/plugin.js'
import { selectOperationDefinitions } from './utils/select-operation-definitions.js'
import { IgnoreMode } from './types/index.js'
import { MetadataStorage, TerminalSelectPluginMetadata } from './constants/index.js'

export interface TerminalSelectPluginOptions {
  mode: IgnoreMode

  persist?: boolean

  /**
   * Remove all previously matcher rules.
   * This means that all rules form `.keqignore` file will be removed.
   */
  clear?: boolean
}


export class TerminalSelectPlugin implements Plugin {
  constructor(private options: TerminalSelectPluginOptions) {}

  apply(compiler: Compiler): void {
    // Prevent duplicate registration
    if (MetadataStorage.has(compiler)) return

    TerminalSelectPlugin.register(compiler)

    compiler.hooks.afterDownload.tapPromise(TerminalSelectPlugin.name, async (task) => {
      const context = compiler.context

      const matcher = context.matcher!
      const documents = context.documents!
      const operationDefinitions = documents.flatMap((document) => document.operations)
      const selectedOperationDefinitions = await selectOperationDefinitions(task, operationDefinitions)

      if (this.options.clear) {
        matcher.append({
          persist: false,
          ignore: true,
          moduleName: '*',
          operationMethod: '*',
          operationPathname: '*',
        })
      }

      for (const op of selectedOperationDefinitions) {
        matcher.append({
          persist: !!this.options.persist,
          ignore: this.options.mode === 'add',
          moduleName: op.module.name,
          operationMethod: op.method,
          operationPathname: op.pathname,
        })
      }
    })
  }

  static register(compiler: Compiler): TerminalSelectPluginMetadata {
    if (!MetadataStorage.has(compiler)) {
      MetadataStorage.set(compiler, {
        hooks: {},
      })
    }
    return MetadataStorage.get(compiler)!
  }

  static of(compiler: Compiler): TerminalSelectPluginMetadata | undefined {
    return this.register(compiler)
  }
}
