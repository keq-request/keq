import fs from 'fs-extra'
import path from 'path'
import { CosmiconfigResult } from 'cosmiconfig'
import { cosmiconfig } from 'cosmiconfig'
import { ListrTask } from 'listr2'
import { IgnoreMatcher, IgnoreMatcherRule } from '~/utils/ignore-matcher.js'
import { findNearestPackageJson, getProjectModuleSystem } from './utils/index.js'
import type { BaseTaskOptions } from '../types/base-task-options.js'
import type { Compiler } from '../../compiler.js'
import { CompilerContext } from '../../types/index.js'
import { parseRuntimeConfig } from './utils/parse-runtime-config.js'
import { MicroFunctionTranslator } from '~/translators/micro-function.translator.js'


export interface SetupTaskOptions {
  config?: string
  debug?: boolean
  tolerant?: boolean

  ignore?: false | {
    rules: IgnoreMatcherRule[]
  }
}

const explore = cosmiconfig('keq')


function main(compiler: Compiler, options: SetupTaskOptions): ListrTask<CompilerContext> {
  return {
    task: async (context, task) => {
      const result: CosmiconfigResult = options?.config
        ? await explore.load(options.config)
        : await explore.search()

      if (!result || ('isEmpty' in result && result.isEmpty)) {
        throw new Error('Cannot find config file.')
      }

      const rc = parseRuntimeConfig(result.config)

      if (options?.debug) {
        await fs.ensureDir('.keq')
        rc.debug = true
      }

      rc.tolerant = Boolean(rc.tolerant)

      if (!rc.translators || !rc.translators.length) {
        rc.translators = [new MicroFunctionTranslator()]
      }

      const packageJsonInfo = findNearestPackageJson()
      if (packageJsonInfo) {
        const moduleSystem = getProjectModuleSystem(packageJsonInfo)
        rc.esm = moduleSystem === 'esm'
      }

      context.rc = rc


      // Setup IgnoreMatcher

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

      context.matcher = matcher

      await compiler.hooks.setup.promise(task)
    },
  }
}

export function createSetupTask(compiler: Compiler, options: SetupTaskOptions & BaseTaskOptions): ListrTask<CompilerContext> {
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
