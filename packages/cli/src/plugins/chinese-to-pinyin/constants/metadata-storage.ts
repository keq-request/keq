import { Compiler } from '~/compiler/index.js'


export interface ChineseToPinyinPluginMetadata {
  applied: boolean
  hooks: object
}

export const MetadataStorage = new WeakMap<Compiler, ChineseToPinyinPluginMetadata>()
