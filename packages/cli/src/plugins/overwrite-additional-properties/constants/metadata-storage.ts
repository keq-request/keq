import { Compiler } from '~/compiler/index.js'


export interface OverwriteAdditionalPropertiesPluginMetadata {
  applied: boolean
}

export const MetadataStorage = new WeakMap<Compiler, OverwriteAdditionalPropertiesPluginMetadata>()
