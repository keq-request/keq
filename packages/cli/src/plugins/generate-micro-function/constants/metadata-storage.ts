import { AsyncSeriesWaterfallHook } from 'tapable'
import { TaskWrapper } from '~/compiler/index.js'
import { Artifact, OperationDefinition } from '~/models/index.js'
import { PluginMetadataStorage } from '~/models/plugin-metadata-storage.js'

export interface GenerateMicroFunctionPluginMetadata {
  applied: boolean
  hooks: {
    afterEntrypointArtifactGenerated: AsyncSeriesWaterfallHook<[Artifact, TaskWrapper]>
    afterMicroFunctionArtifactGenerated: AsyncSeriesWaterfallHook<[Artifact, OperationDefinition, TaskWrapper]>
  }
}

export const MetadataStorage = new PluginMetadataStorage<GenerateMicroFunctionPluginMetadata>(
  '@keq-request/cli:GenerateMicroFunctionPlugin:MetadataStorage',
)
