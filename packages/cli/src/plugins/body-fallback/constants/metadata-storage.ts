import { Compiler } from '~/compiler/index.js'


export interface BodyFallbackPluginMetadata {
  hooks: object
}

export const MetadataStorage = new WeakMap<Compiler, BodyFallbackPluginMetadata>()
