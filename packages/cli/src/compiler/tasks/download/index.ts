import { ListrTask, PRESET_TIMER } from 'listr2'
import { validate } from '@scalar/openapi-parser'
import { ModuleDefinition, ApiDocumentV3_1 } from '~/models/index.js'
import { BaseTaskOptions } from '../types/base-task-options.js'
import type { Compiler } from '~/compiler/compiler.js'
import { CompilerContext } from '~/compiler/index.js'
import { Exception } from '~/exception.js'


interface DownloadTaskOptions {
  skipIgnoredModules?: boolean
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
              if (options?.skipIgnoredModules && matcher.isModuleIgnored(moduleDefinition)) {
                task.skip(`(${moduleDefinition.name}) is ignored`)
                return
              }

              task.output = `Downloaded from ${moduleDefinition.address}`

              const content = await compiler.hooks.download.promise(moduleDefinition.address, moduleDefinition, task)

              if (!content) {
                throw new Exception(moduleDefinition, `Cannot download document from ${moduleDefinition.address}`)
              }

              const json = JSON.parse(content)

              const spec = await compiler.hooks.openapiTransform.promise(json, moduleDefinition, task)

              const { valid, errors } = await validate(json)
              if (!valid) {
                const message = `${moduleDefinition.name} module openapi/swagger file does not conform to the openapi specifications or have grammatical errors, which may cause unexpected errors: \n${errors?.map((e) => `  - ${e.message}`).join('\n')}`
                task.output = message
              }

              const document = new ApiDocumentV3_1(
                spec,
                moduleDefinition,
              )

              ctx.documents?.push(document)
            },
          })),
        {
          concurrent: true,
          exitOnError: false,
          collectErrors: 'minimal',
          rendererOptions: {
            collapseSubtasks: false,
            // collapseSkips: false,
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
