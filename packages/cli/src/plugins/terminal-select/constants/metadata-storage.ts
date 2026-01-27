import { Compiler } from '~/compiler/index.js'


export interface TerminalSelectPluginMetadata {
  hooks: object
}

export const MetadataStorage = new WeakMap<Compiler, TerminalSelectPluginMetadata>()
