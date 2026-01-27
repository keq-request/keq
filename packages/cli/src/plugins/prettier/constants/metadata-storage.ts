import { Compiler } from '~/compiler/index.js'


export interface PrettierPluginMetadata {
  applied: boolean
  hooks: object
}

export const MetadataStorage = new WeakMap<Compiler, PrettierPluginMetadata>()
