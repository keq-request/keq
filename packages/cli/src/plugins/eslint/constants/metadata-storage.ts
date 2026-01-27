import { Compiler } from '~/compiler/index.js'


export interface EslintPluginMetadata {
  hooks: object
}

export const MetadataStorage = new WeakMap<Compiler, EslintPluginMetadata>()
