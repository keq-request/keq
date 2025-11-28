import { ListrTask } from 'listr2'
import { TaskContext } from '../types/task-context.js'
import { selectOperationDefinitions } from './utils/select-operation-definitions.js'
import { IgnoreMode } from '../types/ignore-mode.js'
import { BaseTaskOptions } from '../types/base-task-options.js'

export interface InteractiveTaskOptions {
  mode: IgnoreMode

  persist?: boolean

  /**
   * Remove all previously matcher rules.
   * This means that all rules form `.keqignore` file will be removed.
   */
  clear?: boolean
}


export function createInteractiveTask(options: InteractiveTaskOptions & BaseTaskOptions): ListrTask<TaskContext> {
  return {
    enabled: options?.enabled,
    skip: options?.skip,
    task: async (context, task) => {
      if (!context.setup) throw new Error('Please run setup task first.')
      if (!context.validated) throw new Error('Please run validate task first.')

      const matcher = context.setup.matcher
      const documents = context.validated.documents
      const operationDefinitions = documents.flatMap((document) => document.operations)
      const selectedOperationDefinitions = await selectOperationDefinitions(task, operationDefinitions)

      if (options.clear) {
        matcher.append({
          persist: false,
          ignore: true,
          moduleName: '*',
          operationMethod: '*',
          operationPathname: '*',
        })
      }

      for (const op of selectedOperationDefinitions) {
        matcher.append({
          persist: !!options.persist,
          ignore: options.mode === 'add',
          moduleName: op.module.name,
          operationMethod: op.method,
          operationPathname: op.pathname,
        })
      }
    },
  }
}
