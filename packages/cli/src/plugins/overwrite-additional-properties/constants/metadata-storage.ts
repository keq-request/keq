import { PluginMetadataStorage } from '~/models/plugin-metadata-storage.js'


export interface OverwriteAdditionalPropertiesPluginMetadata {
  applied: boolean
}

export const MetadataStorage = new PluginMetadataStorage<OverwriteAdditionalPropertiesPluginMetadata>(
  '@keq-request/cli:OverwriteAdditionalPropertiesPlugin:MetadataStorage',
)
