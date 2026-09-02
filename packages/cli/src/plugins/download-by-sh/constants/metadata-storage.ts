import { PluginMetadataStorage } from '~/models/plugin-metadata-storage.js'


export interface DownloadByShPluginMetadata {
  applied: boolean
  hooks: object
}

export const MetadataStorage = new PluginMetadataStorage<DownloadByShPluginMetadata>(
  '@keq-request/cli:DownloadByShPlugin:MetadataStorage',
)
