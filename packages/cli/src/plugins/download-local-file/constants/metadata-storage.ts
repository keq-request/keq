import { PluginMetadataStorage } from '~/models/plugin-metadata-storage.js'


export interface DownloadLocalFilePluginMetadata {
  applied: boolean
  hooks: object
}

export const MetadataStorage = new PluginMetadataStorage<DownloadLocalFilePluginMetadata>(
  '@keq-request/cli:DownloadLocalFilePlugin:MetadataStorage',
)
