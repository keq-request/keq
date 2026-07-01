import { Command } from 'commander'
import fs from 'fs-extra'
import { FileSystemCacheStore } from '../cache-store/index.js'
import { getCacheDir, getAllCacheDir } from '../utils/get-cache-dir.js'

export function registerCacheCommand(program: Command): void {
  const cache = program
    .command('cache')
    .description('Manage the download cache')

  cache
    .command('clear')
    .description('Clear cached downloads')
    .option('-c --config <config>', 'The keq-cli config file')
    .option('--all', 'Clear cache for all projects')
    .action(async (options) => {
      if (options.all) {
        await fs.remove(getAllCacheDir()).catch(() => {})
        console.log('All caches cleared.')
      } else {
        const store = new FileSystemCacheStore(getCacheDir(process.cwd()))
        await store.clear()
        console.log('Cache cleared.')
      }
    })
}
