import { ListrTask } from 'listr2'
import { TaskContext } from '~/tasks/types/task-context.js'
import { compileSchemaDefinition } from './utils/compile-schema-definition.js'
import { compileOperationDefinition } from './utils/compile-operation-definition.js'
import { Artifact } from '../utils/artifact.js'
import { requestRenderer } from '~/renderer/request/index.js'
import { BaseTaskOptions } from '../types/base-task-options.js'
import type { Compiler } from '~/compiler/compiler.js'


function main(compiler: Compiler): ListrTask<TaskContext> {
  return {
    task: async (context, task) => {
      if (!context.setup) throw new Error('Please run setup task first.')
      if (!context.shaken) throw new Error('Please run shaking task first.')

      const rc = context.setup.rc
      const matcher = context.setup.matcher
      const documents = context.shaken.documents
        .filter((document) => !matcher.isModuleIgnored(document.module))

      let requestArtifact = new Artifact({
        id: 'request',
        filepath: 'request',
        content: await requestRenderer(),
        extensionName: '.ts',
      })

      requestArtifact.addDependence('keq', ['KeqRequest'])

      requestArtifact = await compiler.hooks.afterCompileKeqRequest
        .promise(
          requestArtifact,
          task,
        )

      const schemaDefinitions = documents.flatMap((document) => document.schemas)
      const operationDefinitions = documents.flatMap((document) => document.operations)

      const schemaArtifacts = await compileSchemaDefinition({ compiler, task, schemaDefinitions })
      const operationArtifacts = await compileOperationDefinition({ compiler, task, rc, operationDefinitions, schemaArtifacts, requestArtifact })

      const artifacts = [requestArtifact, ...schemaArtifacts, ...operationArtifacts]

      context.compiled = {
        artifacts,
      }
    },
  }
}

export function createCompileTask(compiler: Compiler, options?: BaseTaskOptions): ListrTask<TaskContext> {
  return {
    title: 'Compile',
    enabled: options?.enabled,
    skip: options?.skip,
    task: (context, task) => task.newListr(
      [
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
