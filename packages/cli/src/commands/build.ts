import { Command, Option } from 'commander'
import { SupportedMethods } from '../constants/supported-methods.js'
import { Compiler } from '../compiler/compiler.js'
import { FileSystemCacheStore, NullCacheStore } from '../cache-store/index.js'
import type { CacheStore } from '../cache-store/index.js'
import type { FilterRule } from '../utils/matcher.js'
import { xprodFilterRules } from './utils/xprod-filter-rules.js'
import { getCacheDir } from '../utils/get-cache-dir.js'

export function registerBuildCommand(program: Command): void {
  program
    .command('build')
    .description('Build and generate API client code from OpenAPI/Swagger specifications')
    .option('-c --config <config>', 'The keq-cli config file')
    .option('--module <modules...>', 'Filter module(s) to generate')
    .option('--debug', 'Print debug information')
    .option('--tolerant', 'Tolerate wrong swagger/openapi structure')
    .option('--fresh', 'Clean the output directory before building')
    .option('--no-cache', 'Disable download caching')
    .option('-i --interactive', 'Interactive select the scope of generation')
    .addOption(
      new Option('--method <method>', 'Only generate files of the specified operation method')
        .choices([
          ...SupportedMethods,
          ...SupportedMethods.map((method) => method.toUpperCase()),
        ]),
    )
    .option('--pathname <pathname>', 'Only generate files of the specified operation pathname')
    .action(async (options) => {
      const filterRules: FilterRule[] = []

      if (options.module || options.method || options.pathname) {
        filterRules.push(
          {
            deny: true,
            persist: false,
            moduleName: '*',
            operationMethod: '*',
            operationPathname: '/**',
          },
          ...xprodFilterRules({
            module: options.module,
            method: options.method,
            pathname: options.pathname,
            persist: false,
          }),
        )
      } else if (options.interactive) {
        filterRules.push({
          deny: true,
          persist: false,
          moduleName: '*',
          operationMethod: '*',
          operationPathname: '/**',
        })
      }

      let cacheStore: CacheStore
      if (options.cache === false) {
        cacheStore = new NullCacheStore()
      } else {
        cacheStore = new FileSystemCacheStore(getCacheDir(process.cwd()))
        if (options.fresh) {
          await cacheStore.clear()
        }
      }

      const compiler = new Compiler({
        build: true,
        persist: true,
        fresh: !!options.fresh,
        config: options.config,
        debug: !!options.debug,
        tolerant: !!options.tolerant,
        interactive: !!options.interactive && { mode: 'allow' },
        cacheStore,
        filter: filterRules.length > 0
          ? { rules: filterRules }
          : undefined,
      })

      await compiler.run()
    })
}
