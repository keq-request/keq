import { AsyncSeriesWaterfallHook } from 'tapable'
import { Compiler, TaskWrapper } from '~/compiler/index.js'
import { Artifact, OperationDefinition } from '~/models/index.js'

export interface GenerateMicroFunctionPluginMetadata {
  hooks: {
    afterEntrypointGenerated: AsyncSeriesWaterfallHook<[Artifact, TaskWrapper]>
    afterMicroFunctionGenerated: AsyncSeriesWaterfallHook<[Artifact, OperationDefinition, TaskWrapper]>
  }
}

export const metadataStorage = new WeakMap<Compiler, GenerateMicroFunctionPluginMetadata>()
