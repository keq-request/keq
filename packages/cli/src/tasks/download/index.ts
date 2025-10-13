import { ListrTask, PRESET_TIMER } from 'listr2'
import { Context } from '~/types/context'
import { ModuleDefinition } from '../utils/module-definition'
import { ApiDocument } from '../utils/api-document'


export function createDownloadTask(): ListrTask<Context> {
  return {
    title: 'Download',
    task: async (context, task) => {
      if (!context.setup) {
        throw new Error('Please run setup task first.')
      }

      const rc = context.setup.rc

      context.downloaded = {
        documents: [],
      }

      return task.newListr(
        [
          ...Object.entries(rc.modules)
            .map(([moduleName, address]) => new ModuleDefinition(moduleName, address))
            .map((moduleDefinition): ListrTask<Context> => ({
              title: moduleDefinition.name,
              task: async (ctx, task) => {
                task.output = `Downloaded from ${moduleDefinition.address}`
                const document = await ApiDocument.create(moduleDefinition)
                ctx.downloaded!.documents.push(document)
              },
            })),
        ],
        {
          concurrent: true,
          exitOnError: false,
          collectErrors: 'minimal',
          rendererOptions: {
            collapseSubtasks: false,
            timer: PRESET_TIMER,
          },
        },
      )

      // const value = await tasks.run()
      // console.log(value)
      // console.log('-----------------')
      // console.log(tasks.errors)
      // console.log('-----------------')

      // const results = await Promise.allSettled(
      //   Object.entries(rc.modules)
      //     .map(([moduleName, address]) => new ModuleDefinition(moduleName, address))
      //     .map((moduleDefinition) => ApiDocument.create(moduleDefinition)),
      // )


      // const documents: ApiDocument[] = []


      // for (const result of results) {
      //   if (result.status === 'rejected') {
      //     logger.error(String(result.reason.message))
      //     continue
      //   }

      //   const swagger = result.value
      //   documents.push(swagger)

      //   if (rc.debug) {
      //     await fs.writeJSON(`.keq/${swagger.module.name}.swagger.json`, swagger.swagger, { spaces: 2 })
      //   }
      // }


      // if (loader) loader.succeed()

      // return documents
    },
  }
}
