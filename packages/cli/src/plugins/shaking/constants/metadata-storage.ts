import { PluginMetadataStorage } from '~/models/plugin-metadata-storage.js'


export interface ShakingPluginMetadata {
  applied: boolean
  hooks: object
}

export const MetadataStorage = new PluginMetadataStorage<ShakingPluginMetadata>(
  '@keq-request/cli:ShakingPlugin:MetadataStorage',
)
