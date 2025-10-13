import { ListrTask } from 'listr2'
import { Context } from '~/types/context'
import { Debugger } from '~/utils/debugger'


export function createValidateTask(): ListrTask<Context> {
  return {
    title: 'Validate',
    task: async (context, task) => {
      if (!context.setup) throw new Error('Please run setup task first.')
      if (!context.downloaded) throw new Error('Please run download task first.')

      const rc = context.setup.rc
      const downloadedDocuments = context.downloaded.documents
      const debug = new Debugger(rc)

      context.validated = {
        documents: [],
      }

      return task.newListr(
        downloadedDocuments.map((document): ListrTask<Context> => ({
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
