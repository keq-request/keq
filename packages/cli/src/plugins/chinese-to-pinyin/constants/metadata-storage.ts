import { Compiler } from '~/compiler/index.js'


export interface ChineseToPinyinPluginMetadata {
  hooks: object
}

export const MetadataStorage = new WeakMap<Compiler, ChineseToPinyinPluginMetadata>()
