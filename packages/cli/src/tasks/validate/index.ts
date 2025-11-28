import { ListrTask } from 'listr2'
import { TaskContext } from '~/tasks/types/task-context.js'
import { Debugger } from '~/utils/debugger.js'
import { BaseTaskOptions } from '../types/base-task-options.js'
import type { Compiler } from '~/compiler.js'


function main(): ListrTask<TaskContext> {
  return {
    task: (context, task) => {
      if (!context.setup) throw new Error('Please run setup task first.')
      if (!context.downloaded) throw new Error('Please run download task first.')

      const rc = context.setup.rc
      const downloadedDocuments = context.downloaded.documents
      const debug = new Debugger(rc)

      context.validated = {
        documents: [],
      }

      return task.newListr(
        downloadedDocuments.map((document): ListrTask<TaskContext> => ({
          title: document.module.name,
          task: async (ctx, task) => {
            const { valid, errors } = await document.validate()

            if (!valid) {
              const message = `${document.module.name} module swagger file does not conform to the openapi@3.1 standard specifications or have grammatical errors, which may cause unexpected errors: \n${errors?.map((e) => `  - ${e.message}`).join('\n')}`
              task.output = message
            }

            const fixedDocument = document.fix()
            debug.writeSwagger(`.keq/${document.module.name}.fixed.json`, fixedDocument.swagger)

            const v3_1Document = await fixedDocument.toV3_1(rc)
            ctx.validated!.documents.push(v3_1Document)
          },
        })),
        {
          concurrent: true,
          rendererOptions: {
            collapseSubtasks: false,
            persistentOutput: true,
          },
        },
      )
    },
  }
}

export function createValidateTask(compiler: Compiler, options?: BaseTaskOptions): ListrTask<TaskContext> {
  return {
    title: 'Validate',
    enabled: options?.enabled,
    skip: options?.skip,
    task: (context, task) => task.newListr(
      [
        main(),
        {
          task: (context, task) => compiler.hooks.afterValidate
            .promise(),
        },
      ],
      {
        concurrent: false,
      },
    ),
  }
}
