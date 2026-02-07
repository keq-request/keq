import fs from 'fs-extra'
import { Plugin } from '~/types/index.js'
import { Compiler } from '~/compiler/index.js'


export class CleanPlugin implements Plugin {
  apply(compiler: Compiler): void {
    compiler.hooks.beforePersist.tapPromise(CleanPlugin.name, async () => {
      const rc = compiler.context.rc
      if (!rc) throw new Error('Please run setup task first.')

      const outdir = rc.outdir
      await fs.emptyDir(outdir)
    })
  }
}
