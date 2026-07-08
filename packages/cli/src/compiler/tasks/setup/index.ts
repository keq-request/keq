import fs from 'fs-extra'
import path from 'path'
import { CosmiconfigResult } from 'cosmiconfig'
import { cosmiconfig } from 'cosmiconfig'
import { ListrTask } from 'listr2'
import { Matcher, FilterRule } from '~/utils/matcher.js'
import { ConfigNotFoundException } from '~/exceptions/index.js'
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

  filter?: false | {
    rules: FilterRule[]
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
        throw new ConfigNotFoundException(options?.config ?? process.cwd())
      }

      context.workdir = path.dirname(result.filepath)

      const rc = parseRuntimeConfig(result.config)

      rc.outdir = path.isAbsolute(rc.outdir)
        ? rc.outdir
        : path.resolve(context.workdir, rc.outdir)

      if (options?.debug) {
        await fs.ensureDir(path.resolve(context.workdir, '.keq'))
        rc.debug = true
      }

      rc.tolerant = Boolean(rc.tolerant || options?.tolerant)

      if (!rc.translators || !rc.translators.length) {
        rc.translators = [new MicroFunctionTranslator()]
      }

      const packageJsonInfo = findNearestPackageJson()
      if (packageJsonInfo) {
        const moduleSystem = getProjectModuleSystem(packageJsonInfo)
        rc.rendering.esm = moduleSystem === 'esm'
      }

      context.rc = rc


      // Setup Matcher

      let matcher: Matcher = new Matcher([])
      // filter === false means skip .keqfilter file loading entirely (e.g. --all flag)
      if (options.filter !== false && result.filepath) {
        const filterFilepath = path.resolve(path.dirname(result.filepath), '.keqfilter')
        if (await fs.exists(filterFilepath)) {
          matcher = await Matcher.read(filterFilepath)
        }
      }

      const filterRules = options.filter === false ? [] : options.filter?.rules || []
      for (const rule of filterRules) {
        matcher.append({
          persist: !!rule.persist,
          deny: rule.deny,
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
