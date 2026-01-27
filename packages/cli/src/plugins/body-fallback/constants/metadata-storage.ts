import { Compiler } from '~/compiler/index.js'


export interface BodyFallbackPluginMetadata {
  applied: boolean
  hooks: object
}

export const MetadataStorage = new WeakMap<Compiler, BodyFallbackPluginMetadata>()
