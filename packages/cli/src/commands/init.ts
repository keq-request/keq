import { Command } from 'commander'

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize keq configuration file')
    .option('-f --force', 'Force overwrite existing config file')
    .action(async (options) => {
      const { initConfig } = await import('../init.js')
      await initConfig(options)
    })
}
