import * as R from 'ramda'
import { Compiler } from '~/compiler/index.js'
import { Plugin } from '~/types/plugin.js'
import { DownloadHttpFilePlugin } from '../download-http-file/index.js'
import { DownloadLocalFilePlugin } from '../download-local-file/index.js'
import { TransformToOpenAPIv3_1Plugin } from '../transform-to-openapi-v3_1/index.js'
import { GenerateDeclarationPlugin } from '../generate-declaration/index.js'
import { ShakingPlugin } from '../shaking/index.js'
import { TerminalSelectPlugin, TerminalSelectPluginOptions } from '../terminal-select/index.js'
import { GenerateMicroFunctionPlugin } from '../generate-micro-function/index.js'
import { GenerateNestjsModulePlugin } from '../generate-nestjs-module/index.js'


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
      new DownloadHttpFilePlugin().apply(compiler)
      new DownloadLocalFilePlugin().apply(compiler)

      new TransformToOpenAPIv3_1Plugin().apply(compiler)
      new GenerateDeclarationPlugin().apply(compiler)

      if (this.options.build) {
        new ShakingPlugin().apply(compiler)
      }

      if (this.options.interactive) {
        new TerminalSelectPlugin(
          typeof this.options.interactive === 'object'
            ? this.options.interactive
            : { mode: 'except' },
        ).apply(compiler)
      }

      const rc = compiler.context.rc!

      if (rc.mode === 'micro-function') {
        new GenerateMicroFunctionPlugin().apply(compiler)
      } else if (rc.mode === 'nestjs-module') {
        new GenerateNestjsModulePlugin().apply(compiler)
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
