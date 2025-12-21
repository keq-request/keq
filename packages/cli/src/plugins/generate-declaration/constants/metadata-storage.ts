import { AsyncSeriesWaterfallHook } from 'tapable'
import { Compiler, TaskWrapper } from '~/compiler/index.js'
import { Artifact, OperationDefinition, SchemaDefinition } from '~/models/index.js'


export interface GenerateDeclarationPluginMetadata {
  hooks: {
    afterEntrypointGenerated: AsyncSeriesWaterfallHook<[Artifact, TaskWrapper]>
    afterSchemaDeclarationGenerated: AsyncSeriesWaterfallHook<[Artifact, SchemaDefinition, TaskWrapper]>
    afterOperationDeclarationGenerated: AsyncSeriesWaterfallHook<[Artifact, OperationDefinition, TaskWrapper]>
  }
}

export const MetadataStorage = new WeakMap<Compiler, GenerateDeclarationPluginMetadata>()
