import { Compiler } from '~/compiler/compiler.js'
import { Plugin } from '~/types/plugin.js'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)


export class PrettierPlugin implements Plugin {
  apply(compiler: Compiler): void {
    compiler.hooks.afterPersist.tapPromise(PrettierPlugin.name, async () => {
      const files = compiler.context.persisted?.files || []
      if (files.length === 0) return

      const filePaths = files.map((file) => file.path).join(' ')
      await execAsync(`prettier --write ${filePaths}`)
    })
  }
}
