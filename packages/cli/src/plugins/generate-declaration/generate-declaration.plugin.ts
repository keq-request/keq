import { AsyncSeriesWaterfallHook } from 'tapable'
import { Plugin } from '~/types/plugin.js'
import { Compiler, TaskWrapper } from '~/compiler/index.js'
import { Artifact, OperationDefinition, ResponseDefinition, SchemaDefinition } from '~/models/index.js'
import { OperationDeclarationGenerator, SchemaDeclarationGenerator, ResponseDeclarationGenerator } from './generators/index.js'
import { GenerateDeclarationPluginMetadata, MetadataStorage } from './constants/index.js'


export const DECLARATION_GENERATOR = 'declarationGenerator'

export class GenerateDeclarationPlugin implements Plugin {
  name = DECLARATION_GENERATOR

  operationGenerator = new OperationDeclarationGenerator()
  schemaGenerator = new SchemaDeclarationGenerator()
  responseGenerator = new ResponseDeclarationGenerator()

  constructor() {}

  apply(compiler: Compiler): void {
    // Prevent duplicate registration by checking applied flag
    const metadata = GenerateDeclarationPlugin.register(compiler)
    if (metadata.applied) return

    // Mark as applied immediately to prevent re-entry
    metadata.applied = true

    compiler.hooks.compile.tapPromise(GenerateDeclarationPlugin.name, async (task: TaskWrapper) => {
      compiler.context.artifacts?.push(
        ...await this.schemaGenerator.compile(compiler, task),
        ...await this.responseGenerator.compile(compiler, task),
        ...await this.operationGenerator.compile(compiler, task),
      )
    })
  }

  static register(compiler: Compiler): GenerateDeclarationPluginMetadata {
    if (!MetadataStorage.has(compiler)) {
      MetadataStorage.set(compiler, {
        applied: false,
        hooks: {
          afterEntrypointArtifactGenerated: new AsyncSeriesWaterfallHook<[Artifact, TaskWrapper], Artifact>(['artifact', 'task']),
          afterSchemaDeclarationArtifactGenerated: new AsyncSeriesWaterfallHook<[Artifact, SchemaDefinition, TaskWrapper], Artifact>(['artifact', 'schemaDefinition', 'task']),
          afterResponseDeclarationArtifactGenerated: new AsyncSeriesWaterfallHook<[Artifact, ResponseDefinition, TaskWrapper], Artifact>(['artifact', 'responseDefinition', 'task']),
          afterOperationDeclarationArtifactGenerated: new AsyncSeriesWaterfallHook<[Artifact, OperationDefinition, TaskWrapper], Artifact>(['artifact', 'operationDefinition', 'task']),
        },
      })
    }

    return MetadataStorage.get(compiler)!
  }

  static of(compiler: Compiler): GenerateDeclarationPluginMetadata | undefined {
    return this.register(compiler)
  }
}
