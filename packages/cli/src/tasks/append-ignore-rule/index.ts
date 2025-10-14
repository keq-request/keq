import { ListrTask } from 'listr2'
import { IgnoreMatcherRule } from '~/utils/ignore-matcher'
import { TaskContext } from '../types/task-context'
import { IgnoreMode } from '../types/ignore-mode'


export interface AppendIgnoreRulesTaskOptions {
  mode: IgnoreMode
  rules: Pick<IgnoreMatcherRule, 'moduleName' | 'operationMethod' | 'operationPathname'>[]
}

export function createAppendIgnoreRulesTask(options: AppendIgnoreRulesTaskOptions): ListrTask<TaskContext> {
  return {
    title: 'Update .keqignore file',
    task: async (context, task) => {
      if (!context.setup) throw new Error('Setup task has not been executed.')

      const matcher = context.setup.matcher

      for (const rule of options.rules) {
        await matcher.append({
          persist: true,
          ignore: options.mode === 'add',
          moduleName: rule.moduleName,
          operationMethod: rule.operationMethod,
          operationPathname: rule.operationPathname,
        })
      }
    },
  }
}
