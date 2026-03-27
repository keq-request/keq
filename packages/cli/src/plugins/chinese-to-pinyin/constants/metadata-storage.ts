import { PluginMetadataStorage } from '~/models/plugin-metadata-storage.js'


export interface ChineseToPinyinPluginMetadata {
  applied: boolean
  hooks: object
}

export const MetadataStorage = new PluginMetadataStorage<ChineseToPinyinPluginMetadata>(
  '@keq-request/cli:ChineseToPinyinPlugin:MetadataStorage',
)
