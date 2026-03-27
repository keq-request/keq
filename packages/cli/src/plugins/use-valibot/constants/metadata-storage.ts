import { PluginMetadataStorage } from '~/models/plugin-metadata-storage.js'


export interface UseValibotPluginMetadata {
  applied: boolean
}

export const MetadataStorage = new PluginMetadataStorage<UseValibotPluginMetadata>(
  '@keq-request/cli:UseValibotPlugin:MetadataStorage',
)
