import { Compiler } from '~/compiler/index.js'


export interface DownloadHttpFilePluginMetadata {
  hooks: object
}

export const MetadataStorage = new WeakMap<Compiler, DownloadHttpFilePluginMetadata>()
