import { ListrTask } from 'listr2'
import { TaskContext } from '~/tasks/types/task-context.js'
import { compileSchemaDefinition } from './utils/compile-schema-definition.js'
import { compileOperationDefinition } from './utils/compile-operation-definition.js'
import { Artifact } from '../utils/artifact.js'
import { requestRenderer } from '~/renderer/request/index.js'


export interface CompileTaskOptions {
  enabled?: boolean | ((ctx: TaskContext) => boolean | Promise<boolean>)
  skip?: boolean | string | ((ctx: TaskContext) => boolean | string | Promise<boolean | string>)
}

export function createCompileTask(options?: CompileTaskOptions): ListrTask<TaskContext> {
  return {
    title: 'Compile',
    enabled: options?.enabled,
    skip: options?.skip,
    task: async (context, task) => {
      if (!context.setup) throw new Error('Please run setup task first.')
      if (!context.shaken) throw new Error('Please run shaking task first.')

      const rc = context.setup.rc
      const matcher = context.setup.matcher
      const documents = context.shaken.documents
        .filter((document) => !matcher.isModuleIgnored(document.module))

      const requestArtifact = new Artifact({
        id: 'request',
        filepath: 'request',
        content: await requestRenderer(),
        extensionName: '.ts',
      })

      const schemaDefinitions = documents.flatMap((document) => document.schemas)
      const operationDefinitions = documents.flatMap((document) => document.operations)

      const schemaArtifacts = await compileSchemaDefinition({ schemaDefinitions })
      const operationArtifacts = await compileOperationDefinition({ rc, operationDefinitions, schemaArtifacts, requestArtifact: requestArtifact })

      const artifacts = [requestArtifact, ...schemaArtifacts, ...operationArtifacts]

      context.compiled = {
        artifacts,
      }
    },
  }
}
