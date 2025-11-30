import { ListrTask } from 'listr2'
import { TaskContext } from '~/tasks/types/task-context.js'
import { BaseTaskOptions } from '../types/base-task-options.js'
import type { Compiler } from '~/compiler/compiler.js'


export interface ShakingTaskOptions {
  skipIgnoredModules?: boolean
  skipEmptyDocuments?: boolean
}

function main(compiler: Compiler, options?: ShakingTaskOptions): ListrTask<TaskContext> {
  return {
    task: (context, task) => {
      if (!context.setup) throw new Error('Please run setup task first.')
      if (!context.validated) throw new Error('Please run validate task first.')

      const matcher = context.setup.matcher
      const documents = context.validated.documents

      context.shaken = {
        documents: [],
      }

      return task.newListr(
        documents.map((document): ListrTask<TaskContext> => ({
          title: document.module.name,
          task: (ctx, task) => {
            if (options?.skipIgnoredModules && matcher.isModuleIgnored(document.module)) {
              task.skip(`${document.module.name} module is ignored`)
              return
            }

            const shakenDocument = document.sharking(
              (operationDefinition) => !matcher.isOperationIgnored(operationDefinition),
            )

            if (options?.skipEmptyDocuments && shakenDocument.isEmpty()) {
              task.skip(`${document.module.name} module is empty`)
              return
            }

            ctx.shaken!.documents.push(shakenDocument)
          },
        })),
        {
          concurrent: true,
          rendererOptions: {
            collapseSubtasks: false,
            suffixSkips: true,
          },
        },
      )
    },
  }
}


export function createShakingTask(compiler: Compiler, options?: ShakingTaskOptions & BaseTaskOptions): ListrTask<TaskContext> {
  return {
    title: 'Shaking',
    enabled: options?.enabled,
    skip: options?.skip,
    task: (context, task) => task.newListr(
      [
        main(compiler, options),
        {
          task: (context, task) => compiler.hooks.afterShaking
            .promise(task),
        },
      ],
      {
        concurrent: false,
      },
    ),
  }
}
