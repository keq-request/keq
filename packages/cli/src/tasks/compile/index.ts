import { ListrTask } from 'listr2'
import { Context } from '~/types/context'
import { compileSchemaDefinition } from './utils/compile-schema-definition'
import { compileOperationDefinition } from './utils/compile-operation-definition'


export function createCompileTask(): ListrTask<Context> {
  return {
    title: 'Compile',
    task: async (context, task) => {
      if (!context.setup) throw new Error('Please run setup task first.')
      if (!context.shaken) throw new Error('Please run shaking task first.')

      const rc = context.setup.rc
      const documents = context.shaken.documents

      const schemaDefinitions = documents.flatMap((document) => document.schemas)
      const operationDefinitions = documents.flatMap((document) => document.operations)

      const schemaArtifacts = await compileSchemaDefinition({ schemaDefinitions })
      const operationArtifacts = await compileOperationDefinition({ rc, operationDefinitions, schemaArtifacts })

      const artifacts = [...schemaArtifacts, ...operationArtifacts]

      context.compiled = {
        artifacts,
      }
    },
  }
}
