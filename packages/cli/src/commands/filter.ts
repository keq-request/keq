import { Argument, Command, Option } from 'commander'
import { SupportedMethods } from '../constants/supported-methods.js'
import { Compiler } from '../compiler/compiler.js'

export function registerFilterCommand(program: Command): void {
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
}
