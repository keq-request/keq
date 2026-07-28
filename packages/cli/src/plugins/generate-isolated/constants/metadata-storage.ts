import { AsyncSeriesWaterfallHook } from 'tapable'
import { Artifact, OperationDefinition } from '~/models/index.js'
import { Compiler, TaskWrapper } from '~/compiler/index.js'

export interface GenerateIsolatedPluginMetadata {
  applied: boolean
  hooks: {
    afterEntrypointArtifactGenerated: AsyncSeriesWaterfallHook<[Artifact, TaskWrapper], Artifact>
    afterIsolatedOperationArtifactGenerated: AsyncSeriesWaterfallHook<[Artifact, OperationDefinition, TaskWrapper], Artifact>
  }
}

export const MetadataStorage = new WeakMap<Compiler, GenerateIsolatedPluginMetadata>()
