import { AsyncSeriesWaterfallHook } from 'tapable'
import { Compiler, TaskWrapper } from '~/compiler/index.js'
import { OperationDeclarationGenerator, SchemaDeclarationGenerator } from './generators/index.js'
import { Artifact, OperationDefinition, SchemaDefinition } from '~/models/index.js'
import { Plugin } from '~/types/plugin.js'
import { GenerateDeclarationPluginMetadata, MetadataStorage } from './constants/index.js'


export const DECLARATION_GENERATOR = 'declarationGenerator'

export class GenerateDeclarationPlugin implements Plugin {
  name = DECLARATION_GENERATOR

  operationGenerator = new OperationDeclarationGenerator()
  schemaGenerator = new SchemaDeclarationGenerator()

  constructor() {}

  apply(compiler: Compiler): void {
    GenerateDeclarationPlugin.createMetadata(compiler)

    compiler.hooks.compile.tapPromise(GenerateDeclarationPlugin.name, async (task: TaskWrapper) => {
      compiler.context.artifacts?.push(
        ...await this.schemaGenerator.compile(compiler, task),
        ...await this.operationGenerator.compile(compiler, task),
      )
    })
  }

  static createMetadata(compiler: Compiler): GenerateDeclarationPluginMetadata {
    if (!MetadataStorage.has(compiler)) {
      MetadataStorage.set(compiler, {
        hooks: {
          afterEntrypointGenerated: new AsyncSeriesWaterfallHook<[Artifact, TaskWrapper], Artifact>(['artifact', 'task']),
          afterSchemaDeclarationGenerated: new AsyncSeriesWaterfallHook<[Artifact, SchemaDefinition, TaskWrapper], Artifact>(['artifact', 'schemaDefinition', 'task']),
          afterOperationDeclarationGenerated: new AsyncSeriesWaterfallHook<[Artifact, OperationDefinition, TaskWrapper], Artifact>(['artifact', 'operationDefinition', 'task']),
        },
      })
    }
    return MetadataStorage.get(compiler)!
  }

  static of(compiler: Compiler): GenerateDeclarationPluginMetadata | undefined {
    return MetadataStorage.get(compiler)
  }
}
