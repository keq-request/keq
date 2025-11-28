import { ListrTask, PRESET_TIMER } from 'listr2'
import { ModuleDefinition } from '../utils/module-definition.js'
import { ApiDocument } from '../utils/api-document.js'
import { TaskContext } from '../types/task-context.js'
import { BaseTaskOptions } from '../types/base-task-options.js'
import type { Compiler } from '~/compiler.js'


interface DownloadTaskOptions {
  skipIgnoredModules?: boolean
}

function main(compiler: Compiler, options?: DownloadTaskOptions): ListrTask<TaskContext> {
  return {
    task: (context, task) => {
      if (!context.setup) {
        throw new Error('Please run setup task first.')
      }

      const rc = context.setup.rc
      const matcher = context.setup.matcher

      context.downloaded = {
        documents: [],
      }

      return task.newListr(
        Object.entries(rc.modules)
          .map(([moduleName, address]) => new ModuleDefinition(moduleName, address))
          .map((moduleDefinition): ListrTask<TaskContext> => ({
            title: moduleDefinition.name,
            task: async (ctx, task) => {
              if (options?.skipIgnoredModules && matcher.isModuleIgnored(moduleDefinition)) {
                task.skip(`(${moduleDefinition.name}) is ignored`)
                return
              }

              task.output = `Downloaded from ${moduleDefinition.address}`
              const document = await ApiDocument.create(moduleDefinition)
              ctx.downloaded!.documents.push(document)
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

export function createDownloadTask(compiler: Compiler, options?: DownloadTaskOptions & BaseTaskOptions): ListrTask<TaskContext> {
  return {
    title: 'Download',
    enabled: options?.enabled,
    skip: options?.skip,
    task: (_, task) => task.newListr(
      [
        main(compiler, options),
        {
          task: (context, task) => compiler.hooks.afterDownload
            .promise(),
        },
      ],
      {
        concurrent: false,
      },
    ),
  }
}
