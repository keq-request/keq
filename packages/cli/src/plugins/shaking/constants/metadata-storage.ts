import { Compiler } from '~/compiler/index.js'


export interface ShakingPluginMetadata {
  hooks: object
}

export const MetadataStorage = new WeakMap<Compiler, ShakingPluginMetadata>()
