import { Compiler } from '~/compiler/index.js'


export interface DownloadHttpFilePluginMetadata {
  applied: boolean
  hooks: object
}

export const MetadataStorage = new WeakMap<Compiler, DownloadHttpFilePluginMetadata>()
