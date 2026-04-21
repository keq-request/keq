import * as R from 'ramda'
import { Compiler } from '~/compiler/index.js'
import { Plugin } from '~/types/plugin.js'
import { DownloadHttpFilePlugin } from '../download-http-file/index.js'
import { DownloadLocalFilePlugin } from '../download-local-file/index.js'
import { ShakingPlugin } from '../shaking/index.js'
import { TerminalSelectPlugin, TerminalSelectPluginOptions } from '../terminal-select/index.js'
import { CleanPlugin } from '../clean/index.js'


interface InitializePluginOptions {
  build?: boolean
  fresh?: boolean
  interactive?: boolean | TerminalSelectPluginOptions

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

      if (this.options.fresh) {
        plugins.push(new CleanPlugin())
      }

      if (rc.plugins && rc.plugins.length) {
        plugins.push(...rc.plugins)
      }

      for (const plugin of plugins) {
        plugin.apply(compiler)
      }
    })
  }
}
