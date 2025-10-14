import { ListrTask } from 'listr2'
import { TaskContext } from '~/tasks/types/task-context.js'


interface ShakingTaskOptions {
  enabled?: boolean | ((ctx: TaskContext) => boolean | Promise<boolean>)
  skip?: boolean | string | ((ctx: TaskContext) => boolean | string | Promise<boolean | string>)

  skipIgnoredModules?: boolean
  skipEmptyDocuments?: boolean
}


export function createShakingTask(options?: ShakingTaskOptions): ListrTask<TaskContext> {
  return {
    title: 'Shaking',
    enabled: options?.enabled,
    skip: options?.skip,
    task: async (context, task) => {
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
          task: async (ctx, task) => {
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
