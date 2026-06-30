import path from 'path'
import { Command } from 'commander'
import { FileSystemCacheStore } from '../cache-store/index.js'

export function registerCacheCommand(program: Command): void {
  const cache = program
    .command('cache')
    .description('Manage the download cache')

  cache
    .command('clear')
    .description('Clear all cached downloads')
    .option('-c --config <config>', 'The keq-cli config file')
    .action(async () => {
      const cacheDir = path.resolve(process.cwd(), '.keq/cache')
      const store = new FileSystemCacheStore(cacheDir)
      await store.clear()
      console.log('Cache cleared.')
    })
}
