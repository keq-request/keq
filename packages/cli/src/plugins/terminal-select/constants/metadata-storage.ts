import { PluginMetadataStorage } from '~/models/plugin-metadata-storage.js'


export interface TerminalSelectPluginMetadata {
  applied: boolean
  hooks: object
}

export const MetadataStorage = new PluginMetadataStorage<TerminalSelectPluginMetadata>(
  '@keq-request/cli:TerminalSelectPlugin:MetadataStorage',
)
