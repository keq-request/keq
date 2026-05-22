import { Command, Option } from 'commander'
import { SupportedMethods } from '../constants/supported-methods.js'
import { Compiler } from '../compiler/compiler.js'
import type { FilterRule } from '../utils/matcher.js'
import { xprodFilterRules } from './utils/xprod-filter-rules.js'

export function registerApisCommand(program: Command): void {
  program
    .command('apis')
    .description('List API operations and components from OpenAPI/Swagger specifications')
    .option('-c --config <config>', 'The keq-cli config file')
    .option('--tolerant', 'Tolerate wrong swagger/openapi structure')
    .addOption(
      new Option('--includes <includes...>', 'Include specific parts')
        .choices(['operations', 'components']),
    )
    .option('--module <modules...>', 'Filter module(s) to list')
    .addOption(
      new Option('--method <method>', 'Only generate files of the specified operation method')
        .choices([
          ...SupportedMethods,
          ...SupportedMethods.map((method) => method.toUpperCase()),
        ]),
    )
    .option('--pathname <pathnames>', 'Only generate files of the specified operation pathname')
    .addOption(
      new Option('--format <format>', 'Output format')
        .choices(['compact', 'json']),
    )
    .option('--json', 'Output in JSON format (shortcut for --format json)')
    .option('--all', 'Ignore .keqfilter rules and show all modules/operations')
    .option('--debug', 'Print debug information')
    .action(async (options) => {
      if (options.all && (options.module || options.method || options.pathname)) {
        throw new Error("'--all' cannot be used with '--module', '--method', or '--pathname'")
      }

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

      const context = compiler.context
      const documents = context.documents || []

      const includesList = options.includes || ['operations', 'components']
      const includeOperations = includesList.includes('operations')
      const includeComponents = includesList.includes('components')

      const result = documents.map((document) => {
        const item: {
          module: string
          operations?: Array<{ method: string; path: string; operationId: string; summary: string; description: string }>
          components?: { schemas: Array<{ name: string; description: string }> }
        } = {
          module: document.module.name,
        }

        if (includeOperations) {
          item.operations = document.operations.map((operation) => ({
            method: operation.method.toUpperCase(),
            path: operation.pathname,
            operationId: operation.operationId,
            summary: operation.operation.summary || '',
            description: operation.operation.description || '',
          }))
        }

        if (includeComponents) {
          item.components = {
            schemas: document.schemas.map((schema) => {
              const schemaObj = schema.schema as { description?: string }
              return {
                name: schema.name,
                description: schemaObj.description || '',
              }
            }),
          }
        }

        return item
      })

      const format = options.format || (options.json ? 'json' : undefined)

      if (format === 'json') {
        console.log(JSON.stringify(result, null, 2))
      } else if (format === 'compact') {
        for (const item of result) {
          console.log(`\nModule: ${item.module}`)
          console.log('─'.repeat(70))

          if (includeOperations) {
            console.log('\n  APIs:')
            if (!item.operations || item.operations.length === 0) {
              console.log('    (No APIs)')
            } else {
              for (const operation of item.operations) {
                const method = operation.method.padEnd(7)
                const desc = operation.summary || operation.description
                const descText = desc ? `  ${desc}` : ''
                console.log(`    ${method} ${operation.path}${descText}`)
              }
            }
          }

          if (includeComponents) {
            console.log('\n  Schemas:')
            if (!item.components || item.components.schemas.length === 0) {
              console.log('    (No Schemas)')
            } else {
              for (const schema of item.components.schemas) {
                const desc = schema.description ? `  ${schema.description}` : ''
                console.log(`    ${schema.name}${desc}`)
              }
            }
          }
        }

        const totalApis = result.reduce((sum, item) => sum + (item.operations?.length || 0), 0)
        const totalSchemas = result.reduce((sum, item) => sum + (item.components?.schemas.length || 0), 0)
        console.log('\n' + '─'.repeat(70))
        const parts = [`${result.length} modules`]
        if (includeOperations) parts.push(`${totalApis} APIs`)
        if (includeComponents) parts.push(`${totalSchemas} Schemas`)
        console.log(`Total: ${parts.join(', ')}`)
      } else {
        for (const item of result) {
          console.log(`\nModule: ${item.module}`)
          console.log('─'.repeat(70))

          if (includeOperations) {
            console.log('\n  APIs:')
            if (!item.operations || item.operations.length === 0) {
              console.log('    (No APIs)')
            } else {
              for (const operation of item.operations) {
                const method = operation.method.padEnd(7)
                console.log(`    ${method} ${operation.path}`)
                const desc = operation.summary || operation.description
                if (desc) {
                  console.log(`    ${desc}`)
                }
              }
            }
          }

          if (includeComponents) {
            console.log('\n  Schemas:')
            if (!item.components || item.components.schemas.length === 0) {
              console.log('    (No Schemas)')
            } else {
              for (const schema of item.components.schemas) {
                console.log(`    ${schema.name}`)
                if (schema.description) {
                  console.log(`    ${schema.description}`)
                }
              }
            }
          }
        }

        const totalApis = result.reduce((sum, item) => sum + (item.operations?.length || 0), 0)
        const totalSchemas = result.reduce((sum, item) => sum + (item.components?.schemas.length || 0), 0)
        console.log('\n' + '─'.repeat(70))
        const parts = [`${result.length} modules`]
        if (includeOperations) parts.push(`${totalApis} APIs`)
        if (includeComponents) parts.push(`${totalSchemas} Schemas`)
        console.log(`Total: ${parts.join(', ')}`)
      }
    })
}
