import { AsyncSeriesWaterfallHook } from 'tapable'
import { Compiler, TaskWrapper } from '~/compiler/index.js'
import { ApiDocumentV3_1, Artifact } from '~/models/index.js'

export interface GenerateNestjsModulePluginMetadata {
  hooks: {
    afterNestjsModuleArtifactGenerated: AsyncSeriesWaterfallHook<[Artifact, ApiDocumentV3_1, TaskWrapper]>
  }
}

export const MetadataStorage = new WeakMap<Compiler, GenerateNestjsModulePluginMetadata>()
