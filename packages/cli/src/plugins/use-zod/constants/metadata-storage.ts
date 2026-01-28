import { Compiler } from '~/compiler/index.js'


export interface UseZodPluginMetadata {
  applied: boolean
}

export const MetadataStorage = new Map<Compiler, UseZodPluginMetadata>()
