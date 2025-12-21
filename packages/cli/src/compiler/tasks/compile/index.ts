import { ListrTask } from 'listr2'
import { BaseTaskOptions } from '../types/base-task-options.js'
import type { Compiler } from '~/compiler/compiler.js'
import { CompilerContext } from '~/compiler/index.js'
import { RequestGenerator } from '~/generators/index.js'


function main(compiler: Compiler): ListrTask<CompilerContext> {
  return {
    task: async (context, task) => {
      if (!context.rc) throw new Error('Please run setup task first.')
      if (!context.documents) throw new Error('Please run shaking task first.')

      const requestGenerator = new RequestGenerator()
      context.artifacts = [
        ...requestGenerator.compile(),
      ]

      await compiler.hooks.compile.promise(task)
    },
  }
}

export function createCompileTask(compiler: Compiler, options?: BaseTaskOptions): ListrTask<CompilerContext> {
  return {
    title: 'Compile',
    enabled: options?.enabled,
    skip: options?.skip,
    task: (context, task) => task.newListr(
      [
        {
          task: (context, task) => compiler.hooks.beforeCompile
            .promise(task),
        },
        main(compiler),
        {
          task: (context, task) => compiler.hooks.afterCompile
            .promise(task),
        },
      ],
      {
        concurrent: false,
      },
    ),
  }
}
