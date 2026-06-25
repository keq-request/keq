#!/usr/bin/env node
import * as fs from 'fs-extra'
import * as R from 'ramda'
import ora from 'ora'
import chalk from 'chalk'
import semver from 'semver'
import { Command, Option } from 'commander'
import { cosmiconfig } from 'cosmiconfig'
import { CosmiconfigResult } from 'cosmiconfig/dist/types'
import { build } from './build.js'
import { compile } from './compile.js'
import { BuildOptions } from './types/build-options.js'
import { Value } from '@sinclair/typebox/value'
import { RuntimeConfig } from './types/runtime-config.js'
import { OperationFilter } from './types/operation-filter.js'
import { cliPrompt } from './cli-prompt.js'
import { fetchModules } from './utils/fetch-openapi-file.js'
import { sharkingModules } from './utils/sharking-modules.js'
import { regenerateName } from './utils/regenerate-name.js'
import { JSONPath } from 'jsonpath-plus'


if (semver.lt(process.version, '18.0.0')) {
  throw new Error('Node.js version must be greater than 18')
}

const program = new Command()
const explore = cosmiconfig('keq')


program
  .command('build [moduleName]')
  .option('-c --config <config>', 'The build config file')
  .option('-i --interactive', 'Interactive select the scope of generation')
  .addOption(
    new Option('--method <methods...>', 'Only generate files of the specified operation method')
      .choices([
        'get',
        'post',
        'put',
        'delete',
        'patch',
        'head',
        'option',
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'PATCH',
        'HEAD',
        'OPTION',
      ]),
  )
  .option('--pathname <pathnames...>', 'Only generate files of the specified operation pathname')
  .option('--no-append', 'Whether to generate files that not exist')
  .option('--no-update', 'Whether to generate files that exist')
  .option('--debug', 'Print debug information')
  .option('--tolerant', 'tolerate wrong swagger structure')
  .action(async (moduleName, options) => {
    let result: CosmiconfigResult
    if (options.config) {
      result = await explore.load(options.config)
    } else {
      result = await explore.search()
    }

    if (!result || ('isEmpty' in result && result.isEmpty)) {
      throw new Error('Cannot find config file.')
    }


    if (!Value.Check(RuntimeConfig, result.config)) {
      const errors = [...Value.Errors(RuntimeConfig, result.config)]
      const message = errors.map(({ path, message }) => `${path}: ${message}`).join('\n')
      throw new Error(chalk.red(`Invalid Config: ${message}`))
    }

    const rc = Value.Default(RuntimeConfig, result.config) as RuntimeConfig
    if (options.debug) {
      await fs.ensureDir('.keq')
      rc.debug = true
    }
    if (options.tolerant) {
      rc.tolerant = true
    }

    // Filter module
    if (moduleName) {
      if (!(moduleName in rc.modules)) {
        throw new Error(`Cannot find module ${moduleName} in config file.`)
      }

      for (const key of Object.keys(rc.modules)) {
        if (key !== moduleName) {
          console.log(chalk.yellow(`${key} module skipped.`))
        }
      }

      rc.modules = { [moduleName]: rc.modules[moduleName] }
    }

    const loadingModules = ora({
      text: 'loading modules',
      spinner: 'arc',
    }).start()
    let modules = await fetchModules(rc)
    modules = regenerateName(modules, rc)
    loadingModules.succeed()

    const optionMethods: string[] = R.uniq(R.map(R.toLower, <string[]>(options.method || [])))
    const optionPathnames: string[] = options.pathname || []
    let filters: OperationFilter[] = []
    if (options.interactive) {
      filters = await cliPrompt(modules, { methods: optionMethods, pathnames: optionPathnames })
    } else {
      filters = R.xprod(optionMethods, optionPathnames)
        .map(([method, pathname]): OperationFilter => ({ method, pathname }))
    }
    for (const filter of filters) {
      if (R.isNotNil(options.append)) filter.append = options.append
      if (R.isNotNil(options.update)) filter.update = options.update
    }

    const buildOptions: BuildOptions = {
      ...rc,
      modules: await sharkingModules(modules, filters, rc),
    }

    if (rc.debug) {
      await fs.writeJSON('.keq/build-options.json', buildOptions, { spaces: 2 })
    }

    await build(buildOptions)

    for (const [moduleName, document] of Object.entries(buildOptions.modules)) {
      const operationIds: string[] = JSONPath({
        path: '$..operationId',
        json: document.paths,
      })

      const schemas = Object.values(document.components?.schemas || {})
      console.log(chalk.green(`${moduleName} module: ${operationIds.length} Operation generated, ${schemas.length} Schema generated`))
    }
  })

program
  .command('compile <filepath>')
  .description('Build the swagger file')
  .requiredOption('-o, --outdir <outdir>', 'The output directory')
  .requiredOption('-m --module-name <module_name>', 'The module name')
  .addOption(new Option('--file-naming-style <fileNamingStyle>').choices(['camelCase', 'capitalCase', 'constantCase', 'dotCase', 'headerCase', 'noCase', 'paramCase', 'pascalCase', 'pathCase', 'sentenceCase', 'snakeCase'])
    .default('snakeCase'))
  .option('--request <request>', 'The request package used in compiled result')
  .option('--no-strict', 'disable strict mode', true)
  .action(async (filepath, options) => {
    await compile({
      moduleName: options.moduleName,
      filepath,
      ...options,
    })
  })

async function main(): Promise<void> {
  program.on('command:*', function (operands) {
    throw new Error(`Unknown command '${String(operands[0])}'`)
  })

  try {
    await program.parseAsync(process.argv)
  } catch (err) {
    if (process.argv.includes('--debug')) {
      console.error(err)
    } else {
      console.error(chalk.red(err instanceof Error ? err.message : String(err)))
    }
  }
}

void main()
