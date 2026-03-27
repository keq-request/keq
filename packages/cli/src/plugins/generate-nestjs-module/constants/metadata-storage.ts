import { AsyncSeriesWaterfallHook } from 'tapable'
import { TaskWrapper } from '~/compiler/index.js'
import { ApiDocumentV3_1, Artifact } from '~/models/index.js'
import { PluginMetadataStorage } from '~/models/plugin-metadata-storage.js'

export interface GenerateNestjsModulePluginMetadata {
  applied: boolean
  hooks: {
    afterNestjsModuleArtifactGenerated: AsyncSeriesWaterfallHook<[Artifact, ApiDocumentV3_1, TaskWrapper]>
  }
}

export const MetadataStorage = new PluginMetadataStorage<GenerateNestjsModulePluginMetadata>(
  '@keq-request/cli:GenerateNestjsModulePlugin:MetadataStorage',
)
