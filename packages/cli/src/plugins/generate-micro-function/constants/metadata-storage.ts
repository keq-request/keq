import { AsyncSeriesWaterfallHook } from 'tapable'
import { Compiler, TaskWrapper } from '~/compiler/index.js'
import { Artifact, OperationDefinition } from '~/models/index.js'

export interface GenerateMicroFunctionPluginMetadata {
  hooks: {
    afterEntrypointArtifactGenerated: AsyncSeriesWaterfallHook<[Artifact, TaskWrapper]>
    afterMicroFunctionArtifactGenerated: AsyncSeriesWaterfallHook<[Artifact, OperationDefinition, TaskWrapper]>
  }
}

export const MetadataStorage = new WeakMap<Compiler, GenerateMicroFunctionPluginMetadata>()
