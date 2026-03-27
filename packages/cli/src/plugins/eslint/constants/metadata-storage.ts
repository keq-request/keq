import { PluginMetadataStorage } from '~/models/plugin-metadata-storage.js'


export interface EslintPluginMetadata {
  applied: boolean
  hooks: object
}

export const MetadataStorage = new PluginMetadataStorage<EslintPluginMetadata>(
  '@keq-request/cli:EslintPlugin:MetadataStorage',
)
