import { Compiler } from '~/compiler/index.js'


export interface ShakingPluginMetadata {
  applied: boolean
  hooks: object
}

export const MetadataStorage = new WeakMap<Compiler, ShakingPluginMetadata>()
