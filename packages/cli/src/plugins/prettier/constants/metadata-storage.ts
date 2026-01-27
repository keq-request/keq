import { Compiler } from '~/compiler/index.js'


export interface PrettierPluginMetadata {
  hooks: object
}

export const MetadataStorage = new WeakMap<Compiler, PrettierPluginMetadata>()
