import { AsyncSeriesWaterfallHook } from 'tapable'
import { Compiler, TaskWrapper } from '~/compiler/index.js'
import { Artifact, OperationDefinition, ResponseDefinition, SchemaDefinition } from '~/models/index.js'


export interface GenerateDeclarationPluginMetadata {
  applied: boolean
  hooks: {
    afterEntrypointArtifactGenerated: AsyncSeriesWaterfallHook<[Artifact, TaskWrapper]>
    afterSchemaDeclarationArtifactGenerated: AsyncSeriesWaterfallHook<[Artifact, SchemaDefinition, TaskWrapper]>
    afterResponseDeclarationArtifactGenerated: AsyncSeriesWaterfallHook<[Artifact, ResponseDefinition, TaskWrapper]>
    afterOperationDeclarationArtifactGenerated: AsyncSeriesWaterfallHook<[Artifact, OperationDefinition, TaskWrapper]>
  }
}

export const MetadataStorage = new Map<Compiler, GenerateDeclarationPluginMetadata>()
