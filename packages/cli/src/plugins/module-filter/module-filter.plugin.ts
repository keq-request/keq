import * as R from 'ramda'
import { Compiler } from '~/compiler/index.js'
import { Plugin } from '~/types/index.js'

interface ModuleFilterPluginOptions {
  includes: string[]
}

export class ModuleFilterPlugin implements Plugin {
  constructor(private options: ModuleFilterPluginOptions) {
    if (!options.includes.length) {
      throw new Error('ModuleFilterPlugin requires at least one module to include.')
    }
  }

  apply(compiler: Compiler): void {
    compiler.hooks.afterSetup.tap(ModuleFilterPlugin.name, (task) => {
      const rc = compiler.context.rc!
      const matcher = compiler.context.matcher!

      const notExistModules = this.options.includes.filter((moduleName) => !(moduleName in rc.modules))
      if (notExistModules.length) {
        throw new Error(`Cannot find module(s) ${notExistModules.join(', ')} in config file.`)
      }

      const ignoredModules = R.difference(R.keys(rc.modules), this.options.includes)
      for (const moduleName of ignoredModules) {
        matcher.append({
          persist: false,
          ignore: true,
          moduleName,
          operationMethod: '*',
          operationPathname: '*',
        })
      }
    })
  }
}
