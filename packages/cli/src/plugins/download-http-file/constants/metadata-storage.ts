import { PluginMetadataStorage } from '~/models/plugin-metadata-storage.js'


export interface DownloadHttpFilePluginMetadata {
  applied: boolean
  hooks: object
}

export const MetadataStorage = new PluginMetadataStorage<DownloadHttpFilePluginMetadata>(
  '@keq-request/cli:DownloadHttpFilePlugin:MetadataStorage',
)
