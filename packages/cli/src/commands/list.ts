import * as path from 'path'
import { Command } from 'commander'
import { Compiler } from '../compiler/compiler.js'
import { findInvalidFiles } from '../utils/scan-generated-files.js'

export function registerListCommand(program: Command): void {
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
        const validFilePaths = (context.artifacts || []).map((artifact) => artifact.filepath)
        const invalidFiles = await findInvalidFiles(context.rc.outdir, validFilePaths)

        for (const file of invalidFiles) {
          const fullPath = `./${path.join(context.rc.outdir, file.relativePath)}`
          console.log(fullPath)
        }
      } else {
        const artifacts = context.artifacts || []

        for (const artifact of artifacts) {
          const fullPath = `./${path.join(context.rc.outdir, artifact.filepath)}`
          console.log(fullPath)
        }
      }
    })
}
