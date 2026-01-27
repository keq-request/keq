import * as R from 'ramda'
import { Compiler } from '~/compiler/index.js'
import { Plugin } from '~/types/plugin.js'
import { DownloadHttpFilePlugin } from '../download-http-file/index.js'
import { DownloadLocalFilePlugin } from '../download-local-file/index.js'
import { ShakingPlugin } from '../shaking/index.js'
import { TerminalSelectPlugin, TerminalSelectPluginOptions } from '../terminal-select/index.js'


interface InitializePluginOptions {
  build?: boolean
  interactive?: boolean | TerminalSelectPluginOptions

  includes?: string[]
}

export class InitializePlugin implements Plugin {
  constructor(private options: InitializePluginOptions) {
  }

  apply(compiler: Compiler): void {
    compiler.hooks.setup.tap(InitializePlugin.name, (task) => {
      const plugins: Plugin[] = [
        new DownloadHttpFilePlugin(),
        new DownloadLocalFilePlugin(),
      ]

      if (this.options.build) {
        plugins.push(new ShakingPlugin())
      }

      if (this.options.interactive) {
        plugins.push(
          new TerminalSelectPlugin(
            typeof this.options.interactive === 'object'
              ? this.options.interactive
              : { mode: 'except' },
          ),
        )
      }

      const rc = compiler.context.rc!

      plugins.push(
        ...R.unnest(
          (rc.translators || []).map((translator) => {
            const plugins = translator.apply()
            return plugins
          }),
        ),
      )

      if (rc.plugins && rc.plugins.length) {
        plugins.push(...rc.plugins)
      }

      for (const plugin of plugins) {
        plugin.apply(compiler)
      }
    })

    if (this.options.includes && this.options.includes.length) {
      const modulesIncludes = this.options.includes

      compiler.hooks.afterSetup.tap(InitializePlugin.name, (task) => {
        const rc = compiler.context.rc!
        const matcher = compiler.context.matcher!

        const notExistModules = modulesIncludes.filter((moduleName) => !(moduleName in rc.modules))
        if (notExistModules.length) {
          throw new Error(`Cannot find module(s) ${notExistModules.join(', ')} in config file.`)
        }

        const ignoredModules = R.difference(R.keys(rc.modules), modulesIncludes)
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
}
