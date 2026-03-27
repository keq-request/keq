import { PluginMetadataStorage } from '~/models/plugin-metadata-storage.js'


export interface PrettierPluginMetadata {
  applied: boolean
  hooks: object
}

export const MetadataStorage = new PluginMetadataStorage<PrettierPluginMetadata>(
  '@keq-request/cli:PrettierPlugin:MetadataStorage',
)
