import { Compiler } from '~/compiler/index.js'


export interface DownloadLocalFilePluginMetadata {
  hooks: object
}

export const MetadataStorage = new WeakMap<Compiler, DownloadLocalFilePluginMetadata>()
