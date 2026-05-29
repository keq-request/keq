import { Command, Option } from 'commander'
import { Compiler } from '../compiler/compiler.js'
import { SearchEngine } from '../search/search-engine.js'
import { EmbedderUnavailableError } from '../search/embedder.js'
import type { FilterRule } from '../utils/matcher.js'
import { xprodFilterRules } from './utils/xprod-filter-rules.js'

export function registerSearchCommand(program: Command): void {
  program
    .command('search')
    .description('Semantic search for API operations using natural language')
    .argument('<query>', 'Natural language search query')
    .option('-c --config <config>', 'The keq-cli config file')
    .option('--module <modules...>', 'Filter module(s) to search')
    .option('--limit <limit>', 'Maximum number of results', '10')
    .option('--detail', 'Include full request/response schema in results')
    .addOption(
      new Option('--format <format>', 'Output format')
        .choices(['json', 'compact'])
        .default('json'),
    )
    .option('--all', 'Ignore .keqfilter rules')
    .option('--tolerant', 'Tolerate wrong swagger/openapi structure')
    .option('--debug', 'Print debug information')
    .action(async (query, options) => {
      const filterRules: FilterRule[] = []

      if (options.module && !options.all) {
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
            persist: false,
          }),
        )
      }

      const compiler = new Compiler({
        build: true,
        persist: false,
        silent: true,
        config: options.config,
        debug: !!options.debug,
        tolerant: !!options.tolerant,
        filter: options.all
          ? false
          : filterRules.length > 0
            ? { rules: filterRules }
            : undefined,
      })

      await compiler.run()

      const documents = compiler.context.documents || []
      const engine = new SearchEngine()

      try {
        await engine.buildIndex(documents)
      } catch (e) {
        if (e instanceof EmbedderUnavailableError) {
          console.error(e.message)
          process.exit(1)
        }
        throw e
      }

      const limit = parseInt(options.limit, 10)
      const results = await engine.search(query, { limit, module: options.module })

      if (options.detail) {
        const detailed = results.map((r) => {
          const detail = engine.getDetail(r.module, r.method, r.pathname)
          return detail || r
        })
        printResults(detailed, options.format)
      } else {
        printResults(results, options.format)
      }
    })
}

function printResults(results: unknown[], format: string): void {
  if (format === 'json') {
    console.log(JSON.stringify({ results, total: results.length }, null, 2))
  } else {
    for (const r of results as Array<Record<string, unknown>>) {
      const method = String(r.method).padEnd(7)
      const score = String(r.score)
      console.log(`  [${score}] ${method} ${String(r.pathname)}`)
      if (typeof r.summary === 'string') console.log(`         ${r.summary}`)
      console.log(`         ${String(r.module)} | ${String(r.operationId)}`)
      console.log()
    }
    console.log(`Total: ${results.length} results`)
  }
}
