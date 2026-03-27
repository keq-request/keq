import { PluginMetadataStorage } from '~/models/plugin-metadata-storage.js'


export interface BodyFallbackPluginMetadata {
  applied: boolean
  hooks: object
}

export const MetadataStorage = new PluginMetadataStorage<BodyFallbackPluginMetadata>(
  '@keq-request/cli:BodyFallbackPlugin:MetadataStorage',
)
