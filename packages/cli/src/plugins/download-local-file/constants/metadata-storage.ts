import { Compiler } from '~/compiler/index.js'


export interface DownloadLocalFilePluginMetadata {
  applied: boolean
  hooks: object
}

export const MetadataStorage = new WeakMap<Compiler, DownloadLocalFilePluginMetadata>()
