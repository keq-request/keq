import * as R from 'ramda'
import { ListrTask } from 'listr2'
import { Context } from '~/types/context'
import { OperationFilter } from '~/types/operation-filter'
import { cliPrompt } from '../utils/cli-prompt'


export function createShakingTask(): ListrTask<Context> {
  return {
    title: 'Shaking',
    task: async (context, task) => {
      if (!context.setup) throw new Error('Please run setup task first.')
      if (!context.validated) throw new Error('Please run validate task first.')

      const cli = context.cli
      const documents = context.validated.documents


      const filterMethods: string[] = R.uniq(R.map(R.toLower, <string[]>(cli?.method || [])))
      const filterPathnames: string[] = cli?.pathname || []

      let filters: OperationFilter[] = []

      if (cli?.interactive) {
        filters = await cliPrompt(documents, { methods: filterMethods, pathnames: filterPathnames })
      } else if (!filterPathnames.length && filterMethods.length) {
        filters = filterMethods.map((method) => ({ method }))
      } else {
        filters = R.xprod(filterMethods, filterPathnames)
          .map(([method, pathname]): OperationFilter => ({ method, pathname }))
      }

      context.shaken = {
        // TODO: remove empty documents
        documents: documents.map((document) => document.sharking(filters)),
      }
    },
  }
}
