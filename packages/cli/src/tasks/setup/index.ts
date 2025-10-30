import * as R from 'ramda'
import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import { CosmiconfigResult } from 'cosmiconfig'
import { Value } from '@sinclair/typebox/value'
import { cosmiconfig } from 'cosmiconfig'
import { ListrTask } from 'listr2'
import { RuntimeConfig } from '~/types/runtime-config.js'
import { validateModules } from './utils/validate-modules.js'
import { IgnoreMatcher } from '../../utils/ignore-matcher.js'
import type { TaskContext } from '../types/task-context.js'


export interface SetupTaskOptions {
  config?: string
  debug?: boolean
  tolerant?: boolean
  modules?: string[]
}

const explore = cosmiconfig('keq')

export function createSetupTask(options: SetupTaskOptions): ListrTask<TaskContext> {
  return {
    title: 'Setup',
    task: async (context, task) => {
      const result: CosmiconfigResult = options?.config
        ? await explore.load(options.config)
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

      validateModules(rc.modules)

      if (options?.debug) {
        await fs.ensureDir('.keq')
        rc.debug = true
      }

      if (options?.tolerant) {
        rc.tolerant = true
      }

      let filter: IgnoreMatcher = new IgnoreMatcher([])
      if (result.filepath) {
        const ignoreFilepath = path.resolve(path.dirname(result.filepath), '.keqignore')
        if (await fs.exists(ignoreFilepath)) {
          filter = await IgnoreMatcher.read(ignoreFilepath)
        }
      }

      if (options?.modules && options.modules.length) {
        const notExistModules = options.modules.filter((moduleName) => !(moduleName in rc.modules))
        if (notExistModules.length) {
          throw new Error(`Cannot find module(s) ${notExistModules.join(', ')} in config file.`)
        }

        const ignoredModules = R.difference(R.keys(rc.modules), options.modules)
        for (const moduleName of ignoredModules) {
          filter.append({
            persist: false,
            ignore: true,
            moduleName,
            operationMethod: '*',
            operationPathname: '*',
          })
        }
      }

      context.setup = { rc, matcher: filter }
      // return rc
    },
  }
}
