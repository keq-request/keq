#!/usr/bin/env node
import semver from 'semver'
import { Argument, Command, Option } from 'commander'
import { SupportedMethods } from './constants/supported-methods.js'
import { logger } from './utils/logger.js'
import { Compiler } from './compiler/compiler.js'


if (semver.lt(process.version, '20.0.0')) {
  throw new Error('Node.js version must be greater than 20')
}

const program = new Command()


program
  .command('build')
  .option('-c --config <config>', 'The keq-cli config file')
  .option('--module <modules...>', 'Filter module(s) to generate')
  .option('--debug', 'Print debug information')
  .option('--tolerant', 'Tolerate wrong swagger/openapi structure')
  .option('-i --interactive', 'Interactive select the scope of generation')
  .action(async (options) => {
    const compiler = new Compiler({
      build: true,
      config: options.config,
      includes: options.module,
      debug: !!options.debug,
      tolerant: !!options.tolerant,
      interactive: !!options.interactive && {
        mode: 'except',
        clear: true,
      },
    })

    await compiler.run()
  })


program
  .command('ignore')
  .addArgument(
    new Argument('<mode>', 'The ignore mode')
      .choices(['all', 'add', 'except'])
      .argRequired(),
  )
  .option('-c --config <config>', 'The keq-cli config file')
  .option('--debug', 'Print debug information')
  .option('--module <modules...>')
  .option('--build', 'Build after updating .keqignore file')
  .addOption(
    new Option('--method <method>', 'Only generate files of the specified operation method')
      .choices([
        ...SupportedMethods,
        ...SupportedMethods.map((method) => method.toUpperCase()),
      ]),
  )
  .option('--pathname <pathnames>', 'Only generate files of the specified operation pathname')
  .option('-i --interactive', 'Interactive select the scope of generation')
  .action(async (mode, options) => {
    let compiler: Compiler

    if (mode === 'all') {
      if (options.build) throw new Error("'--build' cannot be used with 'all' mode")

      compiler = new Compiler({
        build: false,
        config: options.config,
        includes: options.module,
        debug: !!options.debug,
        interactive: false,
        ignore: {
          rules: [{
            persist: true,
            ignore: true,
            moduleName: '*',
            operationMethod: '*',
            operationPathname: '*',
          }],
        },
      })
    } else if (options.interactive) {
      if (options.interactive) {
        if (options.method) throw new Error("'--method' cannot be used with '--interactive'")
        if (options.pathname) throw new Error("'--pathname' cannot be used with '--interactive'")
      }

      compiler = new Compiler({
        build: !!options.build,
        config: options.config,
        includes: options.module,
        debug: !!options.debug,

        interactive: {
          mode,
          persist: true,
        },
      })
    } else {
      if (!options.method && !options.pathname) {
        throw new Error("at least one of '-i --interactive', '--method' or '--pathname' must be specified")
      }

      const moduleNames = options.module || ['*']

      compiler = new Compiler({
        build: !!options.build,
        config: options.config,
        debug: !!options.debug,
        includes: options.module,
        ignore: {
          rules: moduleNames.map((moduleNames) => ({
            persist: true,
            ignore: mode === 'add',
            moduleName: moduleNames,
            operationMethod: options.method,
            operationPathname: options.pathname,
          })),
        },
        interactive: false,
      })
    }

    await compiler.run()
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
      logger.error(err instanceof Error ? err.message : String(err))
    }
  }
}

void main()
