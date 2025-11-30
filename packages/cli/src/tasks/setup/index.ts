import * as R from 'ramda'
import fs from 'fs-extra'
import path from 'path'
import { CosmiconfigResult } from 'cosmiconfig'
import { Value } from '@sinclair/typebox/value'
import { cosmiconfig } from 'cosmiconfig'
import { ListrTask } from 'listr2'
import { RuntimeConfig } from '~/types/runtime-config.js'
import { IgnoreMatcher, IgnoreMatcherRule } from '../../utils/ignore-matcher.js'
import { validateModules, findNearestPackageJson, getProjectModuleSystem } from './utils/index.js'
import type { TaskContext } from '../types/task-context.js'
import type { BaseTaskOptions } from '../types/base-task-options.js'
import type { Compiler } from '../../compiler/compiler.js'


export interface SetupTaskOptions {
  config?: string
  debug?: boolean
  tolerant?: boolean
  modules?: string[]

  ignore?: false | {
    rules: IgnoreMatcherRule[]
  }
}

const explore = cosmiconfig('keq')

function main(compiler: Compiler, options: SetupTaskOptions): ListrTask<TaskContext> {
  return {
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
        throw new Error(`Invalid Config: ${message}`)
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

      const packageJsonInfo = findNearestPackageJson()
      if (packageJsonInfo) {
        const moduleSystem = getProjectModuleSystem(packageJsonInfo)
        rc.esm = moduleSystem === 'esm'
      }

      let matcher: IgnoreMatcher = new IgnoreMatcher([])
      if (result.filepath) {
        const ignoreFilepath = path.resolve(path.dirname(result.filepath), '.keqignore')
        if (await fs.exists(ignoreFilepath)) {
          matcher = await IgnoreMatcher.read(ignoreFilepath)
        }
      }

      const ignoreRules = options.ignore === false ? [] : options.ignore?.rules || []
      for (const rule of ignoreRules) {
        matcher.append({
          persist: !!rule.persist,
          ignore: rule.ignore,
          moduleName: rule.moduleName,
          operationMethod: rule.operationMethod,
          operationPathname: rule.operationPathname,
        })
      }

      if (options?.modules && options.modules.length) {
        const notExistModules = options.modules.filter((moduleName) => !(moduleName in rc.modules))
        if (notExistModules.length) {
          throw new Error(`Cannot find module(s) ${notExistModules.join(', ')} in config file.`)
        }

        const ignoredModules = R.difference(R.keys(rc.modules), options.modules)
        for (const moduleName of ignoredModules) {
          matcher.append({
            persist: false,
            ignore: true,
            moduleName,
            operationMethod: '*',
            operationPathname: '*',
          })
        }
      }

      context.setup = { rc, matcher: matcher }

      if (rc.plugins && rc.plugins.length) {
        for (const plugin of rc.plugins) {
          plugin.apply(compiler)
        }
      }
    },
  }
}

export function createSetupTask(compiler: Compiler, options: SetupTaskOptions & BaseTaskOptions): ListrTask<TaskContext> {
  return {
    title: 'Setup',
    enabled: options?.enabled,
    skip: options?.skip,
    task: (context, task) => task.newListr(
      [
        main(compiler, options),
        {
          task: (context, task) => compiler.hooks.afterSetup
            .promise(task),
        },
      ],
      {
        concurrent: false,
      },
    ),
  }
}
