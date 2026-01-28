import { Compiler } from '~/compiler/index.js'


export interface UseValibotPluginMetadata {
  applied: boolean
}

export const MetadataStorage = new Map<Compiler, UseValibotPluginMetadata>()
