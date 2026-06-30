import { ListrTask, PRESET_TIMER } from 'listr2'
import { ModuleDefinition, ApiDocumentV3_1 } from '~/models/index.js'
import { BaseTaskOptions } from '../types/base-task-options.js'
import type { Compiler } from '~/compiler/compiler.js'
import { CompilerContext } from '~/compiler/index.js'
import { Exception } from '~/exception.js'
import { OpenapiUtils } from '~/utils/openapi-utils/index.js'
import { validateSpec } from './validate-spec.js'


interface DownloadTaskOptions {
  skipFilteredModules?: boolean
}

function main(compiler: Compiler, options?: DownloadTaskOptions): ListrTask<CompilerContext> {
  return {
    task: (context, task) => {
      if (!context.rc || !context.matcher) {
        throw new Error('Please run setup task first.')
      }

      const rc = context.rc
      const matcher = context.matcher

      context.documents = []

      return task.newListr(
        Object.entries(rc.modules)
          .map(([moduleName, address]) => new ModuleDefinition(moduleName, address))
          .map((moduleDefinition): ListrTask<CompilerContext> => ({
            title: moduleDefinition.name,
            task: async (ctx, task) => {
              if (options?.skipFilteredModules && matcher.isModuleDenied(moduleDefinition)) {
                task.skip(`(${moduleDefinition.name}) is filtered`)
                return
              }

              task.output = `Downloaded from ${moduleDefinition.address.url}`

              const result = await compiler.hooks.download.promise(moduleDefinition.address, moduleDefinition, task)

              if (!result) {
                throw new Exception(moduleDefinition, `Cannot download document from ${moduleDefinition.address.url}`)
              }

              const { content, fingerprint } = result
              const spec = JSON.parse(content)

              await compiler.hooks.beforeValidate.promise(spec, moduleDefinition)

              const validation = await validateSpec(spec, {
                moduleDefinition,
                tolerant: !!compiler.options.tolerant,
              })
              if (validation.warning) {
                task.output = validation.warning
              }

              OpenapiUtils.dereferenceOperation(spec)

              const document = new ApiDocumentV3_1(
                spec,
                moduleDefinition,
                fingerprint,
              )

              ctx.documents?.push(document)
            },
          })),
        {
          concurrent: true,
          exitOnError: !compiler.options.tolerant,
          collectErrors: compiler.options.tolerant ? 'minimal' : false,
          rendererOptions: {
            collapseSubtasks: false,
            suffixSkips: true,
            timer: PRESET_TIMER,
          },
        },
      )
    },
  }
}

export function createDownloadTask(compiler: Compiler, options?: DownloadTaskOptions & BaseTaskOptions): ListrTask<CompilerContext> {
  return {
    title: 'Download',
    enabled: options?.enabled,
    skip: options?.skip,
    task: (_, task) => task.newListr(
      [
        main(compiler, options),
        {
          task: (context, task) => compiler.hooks.afterDownload
            .promise(task),
        },
      ],
      {
        concurrent: false,
      },
    ),
  }
}
