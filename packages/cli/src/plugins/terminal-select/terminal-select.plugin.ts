import { Compiler } from '~/compiler/index.js'
import { Plugin } from '~/types/plugin.js'
import { selectOperationDefinitions } from './utils/select-operation-definitions.js'
import { FilterMode } from './types/index.js'
import { MetadataStorage, TerminalSelectPluginMetadata } from './constants/index.js'

export interface TerminalSelectPluginOptions {
  mode: FilterMode

  persist?: boolean
}


export class TerminalSelectPlugin implements Plugin {
  constructor(private options: TerminalSelectPluginOptions) {}

  apply(compiler: Compiler): void {
    const metadata = TerminalSelectPlugin.register(compiler)
    if (metadata.applied) return

    // Mark as applied immediately to prevent re-entry
    metadata.applied = true

    compiler.hooks.afterDownload.tapPromise(TerminalSelectPlugin.name, async (task) => {
      const context = compiler.context

      const matcher = context.matcher!
      const documents = context.documents!
      const operationDefinitions = documents.flatMap((document) => document.operations)
      const selectedOperationDefinitions = await selectOperationDefinitions(task, operationDefinitions)

      for (const op of selectedOperationDefinitions) {
        matcher.append({
          persist: !!this.options.persist,
          deny: this.options.mode === 'deny',
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
        applied: false,
        hooks: {},
      })
    }
    return MetadataStorage.get(compiler)!
  }

  static of(compiler: Compiler): TerminalSelectPluginMetadata | undefined {
    return this.register(compiler)
  }
}
