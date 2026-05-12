#!/usr/bin/env node
import * as path from 'path'
import semver from 'semver'
import { Argument, Command, Option } from 'commander'
import { SupportedMethods } from './constants/supported-methods.js'
import { logger } from './utils/logger.js'
import { Compiler } from './compiler/compiler.js'
import { findInvalidFiles } from './utils/scan-generated-files.js'
import { FilterRule } from './utils/matcher.js'
import { xprodMerge } from './utils/xprod-merge.js'


if (semver.lt(process.version, '20.0.0')) {
  throw new Error('Node.js version must be greater than 20')
}


function xprodFilterRules(options: { module?: string[]; method?: string; pathname?: string; persist?: boolean }): FilterRule[] {
  return xprodMerge(
    (options.module || ['*']).map((moduleName) => ({ deny: false, persist: options.persist, moduleName })),
    options.method ? [{ operationMethod: options.method.toLowerCase() }] : [{ operationMethod: '*' }],
    options.pathname ? [{ operationPathname: options.pathname }] : [{ operationPathname: '/**' }],
  ) as unknown as FilterRule[]
}

const program = new Command()


program
  .command('build')
  .description('Build and generate API client code from OpenAPI/Swagger specifications')
  .option('-c --config <config>', 'The keq-cli config file')
  .option('--module <modules...>', 'Filter module(s) to generate')
  .option('--debug', 'Print debug information')
  .option('--tolerant', 'Tolerate wrong swagger/openapi structure')
  .option('--fresh', 'Clean the output directory before building')
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

    const compiler = new Compiler({
      build: true,
      persist: true,
      fresh: !!options.fresh,
      config: options.config,
      debug: !!options.debug,
      tolerant: !!options.tolerant,
      interactive: !!options.interactive && { mode: 'allow' },
      filter: filterRules.length > 0
        ? { rules: filterRules }
        : undefined,
    })

    await compiler.run()
  })


program
  .command('filter')
  .description('Manage filter rules for API generation using .keqfilter file')
  .addArgument(
    new Argument('<mode>', 'The filter mode')
      .choices(['all', 'deny', 'allow'])
      .argRequired(),
  )
  .option('-c --config <config>', 'The keq-cli config file')
  .option('--debug', 'Print debug information')
  .option('--tolerant', 'Tolerate wrong swagger/openapi structure')
  .option('--module <modules...>')
  .option('--build', 'Build after updating .keqfilter file')
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
      if (options.interactive) throw new Error("'--interactive' cannot be used with 'all' mode")
      if (options.module) throw new Error("'--module' cannot be used with 'all' mode")
      if (options.method) throw new Error("'--method' cannot be used with 'all' mode")
      if (options.pathname) throw new Error("'--pathname' cannot be used with 'all' mode")

      compiler = new Compiler({
        build: false,
        persist: true,
        config: options.config,
        debug: !!options.debug,
        tolerant: !!options.tolerant,
        interactive: false,
        filter: {
          rules: [{
            persist: true,
            deny: true,
            moduleName: '*',
            operationMethod: '*',
            operationPathname: '/**',
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
        persist: true,
        config: options.config,
        debug: !!options.debug,
        tolerant: !!options.tolerant,
        interactive: {
          mode,
          persist: true,
        },
        filter: {
          rules: [{
            persist: false,
            deny: true,
            moduleName: '*',
            operationMethod: '*',
            operationPathname: '/**',
          }],
        },
      })
    } else {
      if (!options.method && !options.pathname) {
        throw new Error("at least one of '-i --interactive', '--method' or '--pathname' must be specified")
      }

      const moduleNames = options.module || ['*']

      compiler = new Compiler({
        build: !!options.build,
        persist: true,
        config: options.config,
        debug: !!options.debug,
        tolerant: !!options.tolerant,
        filter: {
          rules: moduleNames.map((moduleNames) => ({
            persist: true,
            deny: mode === 'deny',
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


program
  .command('list')
  .description('List generated files based on current configuration')
  .option('-c --config <config>', 'The keq-cli config file')
  .option('--invalid', 'List only invalid generated files (files not in current build)')
  .option('--debug', 'Print debug information')
  .option('--tolerant', 'Tolerate wrong swagger/openapi structure')
  .action(async (options) => {
    const compiler = new Compiler({
      build: true,
      persist: false,
      silent: true,
      config: options.config,
      debug: !!options.debug,
      tolerant: !!options.tolerant,
    })

    await compiler.run()

    const context = compiler.context

    if (!context.rc) {
      throw new Error('Failed to load configuration')
    }

    if (options.invalid) {
      // Get valid file paths from artifacts
      const validFilePaths = (context.artifacts || []).map((artifact) => artifact.filepath)

      // Find invalid files (all files in outdir not in current build)
      const invalidFiles = await findInvalidFiles(context.rc.outdir, validFilePaths)

      for (const file of invalidFiles) {
        // Join outdir with relative path to show full path with ./ prefix
        const fullPath = `./${path.join(context.rc.outdir, file.relativePath)}`
        console.log(fullPath)
      }
    } else {
      // List files that should be generated based on current config
      const artifacts = context.artifacts || []

      for (const artifact of artifacts) {
        // Join outdir with artifact filepath, similar to persist task, with ./ prefix
        const fullPath = `./${path.join(context.rc.outdir, artifact.filepath)}`
        console.log(fullPath)
      }
    }
  })


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
  .option('--json', 'Output in JSON format')
  .option('--debug', 'Print debug information')
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
    }


    const compiler = new Compiler({
      build: true,
      persist: false,
      silent: true,
      config: options.config,
      debug: !!options.debug,
      tolerant: !!options.tolerant,
      filter: filterRules.length > 0
        ? { rules: filterRules }
        : undefined,
    })

    await compiler.run()

    const context = compiler.context
    const documents = context.documents || []

    // Determine what to include
    const includesList = options.includes || ['operations', 'components']
    const includeOperations = includesList.includes('operations')
    const includeComponents = includesList.includes('components')

    // Build unified data structure
    const result = documents.map((document) => {
      const item: {
        module: string
        operations?: Array<{ method: string; path: string; operationId: string }>
        components?: { schemas: Array<{ name: string }> }
      } = {
        module: document.module.name,
      }

      if (includeOperations) {
        item.operations = document.operations.map((operation) => ({
          method: operation.method.toUpperCase(),
          path: operation.pathname,
          operationId: operation.operationId,
        }))
      }

      if (includeComponents) {
        item.components = {
          schemas: document.schemas.map((schema) => ({
            name: schema.name,
          })),
        }
      }

      return item
    })

    if (options.json) {
      // JSON format output
      console.log(JSON.stringify(result, null, 2))
    } else {
      // Human-readable format output
      for (const item of result) {
        console.log(`\nModule: ${item.module}`)
        console.log('─'.repeat(70))

        // Display APIs
        if (includeOperations) {
          console.log('\n  APIs:')
          if (!item.operations || item.operations.length === 0) {
            console.log('    (No APIs)')
          } else {
            for (const operation of item.operations) {
              const method = operation.method.padEnd(7)
              console.log(`    ${method} ${operation.path}`)
            }
          }
        }

        // Display Schemas
        if (includeComponents) {
          console.log('\n  Schemas:')
          if (!item.components || item.components.schemas.length === 0) {
            console.log('    (No Schemas)')
          } else {
            for (const schema of item.components.schemas) {
              console.log(`    ${schema.name}`)
            }
          }
        }
      }

      // Print summary
      const totalApis = result.reduce((sum, item) => sum + (item.operations?.length || 0), 0)
      const totalSchemas = result.reduce((sum, item) => sum + (item.components?.schemas.length || 0), 0)
      console.log('\n' + '─'.repeat(70))
      const parts = [`${result.length} modules`]
      if (includeOperations) parts.push(`${totalApis} APIs`)
      if (includeComponents) parts.push(`${totalSchemas} Schemas`)
      console.log(`Total: ${parts.join(', ')}`)
    }
  })


program
  .command('init')
  .description('Initialize keq configuration file')
  .option('-f --force', 'Force overwrite existing config file')
  .action(async (options) => {
    const { initConfig } = await import('./init.js')
    await initConfig(options)
  })


program
  .command('install-skill')
  .description('Install predefined Claude Code skill files into .claude/skills/')
  .action(async () => {
    const { installSkill } = await import('./install-skill.js')
    await installSkill()
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
    process.exit(1)
  }
}

void main()
