import * as R from 'ramda'
import * as fs from 'fs-extra'
import chalk from 'chalk'
import { CosmiconfigResult } from 'cosmiconfig/dist/types'
import { Value } from '@sinclair/typebox/value'
import { cosmiconfig } from 'cosmiconfig'
import { CliOptions } from '~/types/cli-options.js'
import { ListrTask } from 'listr2'
import { RuntimeConfig } from '~/types/runtime-config.js'
import { Context } from '~/types/context'


export interface ConfigProcessorOptions {
  cli?: CliOptions
}

const explore = cosmiconfig('keq')

export function createSetupTask(): ListrTask<Context> {
  return {
    title: 'Setup',
    task: async (context, task) => {
      const cli = context.cli

      const result: CosmiconfigResult = cli?.config
        ? await explore.load(cli.config)
        : await explore.search()

      if (!result || ('isEmpty' in result && result.isEmpty)) {
        throw new Error('Cannot find config file.')
      }

      if (!Value.Check(RuntimeConfig, result.config)) {
        const errors = [...Value.Errors(RuntimeConfig, result.config)]
        const message = errors.map(({ path, message }) => `${path}: ${message}`).join('\n')
        throw new Error(chalk.red(`Invalid Config: ${message}`))
      }

      const rc = Value.Default(RuntimeConfig, result.config) as RuntimeConfig

      if (cli?.debug) {
        await fs.ensureDir('.keq')
        rc.debug = true
      }

      if (cli?.tolerant) {
        rc.tolerant = true
      }

      if (cli?.module) {
        const notExistModules = cli.module.filter((moduleName) => !(moduleName in rc.modules))
        if (notExistModules.length) {
          throw new Error(`Cannot find module(s) ${notExistModules.join(', ')} in config file.`)
        }

        rc.modules = R.pick(cli.module, rc.modules)
      }

      if (rc.request) {
        rc.request = rc.request.replace(/\.(ts|js)$/, '')
      }

      context.setup = { rc }
      // return rc
    },
  }
}
