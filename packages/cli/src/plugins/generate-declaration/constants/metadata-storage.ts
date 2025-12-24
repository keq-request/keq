import { AsyncSeriesWaterfallHook } from 'tapable'
import { Compiler, TaskWrapper } from '~/compiler/index.js'
import { Artifact, OperationDefinition, SchemaDefinition } from '~/models/index.js'


export interface GenerateDeclarationPluginMetadata {
  hooks: {
    afterEntrypointArtifactGenerated: AsyncSeriesWaterfallHook<[Artifact, TaskWrapper]>
    afterSchemaDeclarationArtifactGenerated: AsyncSeriesWaterfallHook<[Artifact, SchemaDefinition, TaskWrapper]>
    afterOperationDeclarationArtifactGenerated: AsyncSeriesWaterfallHook<[Artifact, OperationDefinition, TaskWrapper]>
  }
}

export const MetadataStorage = new WeakMap<Compiler, GenerateDeclarationPluginMetadata>()
