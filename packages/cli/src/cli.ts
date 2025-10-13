#!/usr/bin/env node
import chalk from 'chalk'
import semver from 'semver'
import { Command, Option } from 'commander'
import { build } from './tasks/index.js'


if (semver.lt(process.version, '18.0.0')) {
  throw new Error('Node.js version must be greater than 18')
}

const program = new Command()


program
  .command('build')
  .option('-c --config <config>', 'The build config file')
  .option('-i --interactive', 'Interactive select the scope of generation')
  .option('--module <modules...>', 'Filter module(s) to generate')
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
  .option('--debug', 'Print debug information')
  .option('--tolerant', 'Tolerate wrong swagger structure')
  .action(async (options) => {
    await build(options)
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
