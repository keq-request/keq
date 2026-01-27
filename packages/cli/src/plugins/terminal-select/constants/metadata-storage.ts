import { Compiler } from '~/compiler/index.js'


export interface TerminalSelectPluginMetadata {
  applied: boolean
  hooks: object
}

export const MetadataStorage = new WeakMap<Compiler, TerminalSelectPluginMetadata>()
