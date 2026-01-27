import { Compiler } from '~/compiler/compiler.js'
import { Plugin } from '~/types/plugin.js'
import { exec } from 'child_process'
import { promisify } from 'util'
import { PrettierPluginMetadata, MetadataStorage } from './constants/index.js'

const execAsync = promisify(exec)


export class PrettierPlugin implements Plugin {
  apply(compiler: Compiler): void {
    if (!compiler.options.build) return

    // Prevent duplicate registration by checking applied flag
    const metadata = PrettierPlugin.register(compiler)
    if (metadata.applied) return

    // Mark as applied immediately to prevent re-entry
    metadata.applied = true

    compiler.hooks.afterPersist.tapPromise(PrettierPlugin.name, async () => {
      const files = compiler.context.assets || []
      if (files.length === 0) return

      const filePaths = files.map((file) => file.path).join(' ')
      await execAsync(`prettier --write ${filePaths}`)
    })
  }

  static register(compiler: Compiler): PrettierPluginMetadata {
    if (!MetadataStorage.has(compiler)) {
      MetadataStorage.set(compiler, {
        applied: false,
        hooks: {
        },
      })
    }
    return MetadataStorage.get(compiler)!
  }

  static of(compiler: Compiler): PrettierPluginMetadata | undefined {
    return this.register(compiler)
  }
}
