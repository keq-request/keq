#!/usr/bin/env node
import semver from 'semver'
import { Command } from 'commander'
import { logger } from './utils/logger.js'
import { registerBuildCommand } from './commands/build.js'
import { registerFilterCommand } from './commands/filter.js'
import { registerListCommand } from './commands/list.js'
import { registerApisCommand } from './commands/apis.js'
import { registerMockCommand } from './commands/mock.js'
import { registerInitCommand } from './commands/init.js'
import { registerSearchCommand } from './commands/search.js'
import { registerMcpCommand } from './commands/mcp.js'
import { registerCacheCommand } from './commands/cache.js'


if (semver.lt(process.version, '20.0.0')) {
  throw new Error('Node.js version must be greater than 20')
}

const program = new Command()

registerBuildCommand(program)
registerFilterCommand(program)
registerListCommand(program)
registerApisCommand(program)
registerMockCommand(program)
registerInitCommand(program)
registerSearchCommand(program)
registerMcpCommand(program)
registerCacheCommand(program)

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
    process.exit(1)
  }
}

void main()
