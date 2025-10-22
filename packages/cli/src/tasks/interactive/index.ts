import { ListrTask } from 'listr2'
import { TaskContext } from '../types/task-context.js'
import { selectOperationDefinitions } from './utils/select-operation-definitions.js'
import { IgnoreMode } from '../types/ignore-mode.js'

interface InteractiveTaskOptions {
  enabled?: boolean | ((ctx: TaskContext) => boolean | Promise<boolean>)
  skip?: boolean | string | ((ctx: TaskContext) => boolean | string | Promise<boolean | string>)

  mode: IgnoreMode

  // Whether to override existing ignore rules
  override?: boolean
}


export function createInteractiveTask(options: InteractiveTaskOptions): ListrTask<TaskContext> {
  return {
    task: async (context, task) => {
      if (!context.setup) throw new Error('Please run setup task first.')
      if (!context.validated) throw new Error('Please run validate task first.')

      const matcher = context.setup.matcher
      const documents = context.validated.documents
      const operationDefinitions = documents.flatMap((document) => document.operations)
      const selectedOperationDefinitions = await selectOperationDefinitions(task, operationDefinitions)

      if (options.override) {
        matcher.append({
          persist: false,
          ignore: true,
          moduleName: '*',
          operationMethod: '*',
          operationPathname: '*',
        })
      }

      for (const op of selectedOperationDefinitions) {
        await matcher.append({
          persist: true,
          ignore: options.mode === 'add',
          moduleName: op.module.name,
          operationMethod: op.method,
          operationPathname: op.pathname,
        })
      }
    },
  }
}
