import { PluginMetadataStorage } from '~/models/plugin-metadata-storage.js'


export interface DownloadByBashPluginMetadata {
  applied: boolean
  hooks: object
}

export const MetadataStorage = new PluginMetadataStorage<DownloadByBashPluginMetadata>(
  '@keq-request/cli:DownloadByBashPlugin:MetadataStorage',
)
