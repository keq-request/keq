#!/usr/bin/env node
import chalk from 'chalk'
import semver from 'semver'
import { Argument, Command, Option } from 'commander'
import { build, ignore } from './tasks/index.js'
import { SupportedMethods } from './constants/supported-methods.js'


if (semver.lt(process.version, '18.0.0')) {
  throw new Error('Node.js version must be greater than 18')
}

const program = new Command()


program
  .command('build')
  .option('-c --config <config>', 'The keq-cli config file')
  .option('--module <modules...>', 'Filter module(s) to generate')
  .option('--debug', 'Print debug information')
  .option('--tolerant', 'Tolerate wrong swagger structure')
  .option('-i --interactive', 'Interactive select the scope of generation')
  .action(async (options) => {
    await build({
      config: options.config,
      modules: options.module,
      debug: options.debug,
      tolerant: options.tolerant,
      interactive: options.interactive,
    })
  })


program
  .command('ignore')
  .addArgument(
    new Argument('<mode>', 'The ignore mode')
      .choices(['add', 'except'])
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
    if (options.interactive) {
      if (options.interactive) {
        if (options.method) throw new Error("'--method' cannot be used with '--interactive'")
        if (options.pathname) throw new Error("'--pathname' cannot be used with '--interactive'")
      }

      await ignore({
        mode,
        interactive: options.interactive,
        config: options.config,
        debug: options.debug,
        modules: options.module,
        rules: [],
        build: options.build,
      })
    } else {
      if (!options.module) throw new Error("required option '--module <module>' not specified")
      if (!options.method) throw new Error("required option '--method <method>' not specified")
      if (!options.pathname) throw new Error("required option '--pathname <pathnames>' not specified")

      await ignore({
        mode,
        config: options.config,
        debug: options.debug,
        modules: options.module,
        rules: options.module.map((moduleName) => ({
          moduleName,
          operationMethod: options.method,
          operationPathname: options.pathname,
        })),
        build: options.build,
      })
    }
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
