import { Value } from '@sinclair/typebox/value'
import { RawConfig, RuntimeConfig, Plugin, Translator } from '~/types/index.js'


export function parseRuntimeConfig(data: unknown): RuntimeConfig {
  try {
    // Preserve the original plugins array to avoid losing Plugin instance properties
    const originalPlugins = typeof data === 'object' && data !== null && 'plugins' in data
      ? (data as Record<string, unknown>).plugins
      : undefined

    const originTranslators = typeof data === 'object' && data !== null && 'translators' in data
      ? (data as Record<string, unknown>).translators
      : undefined

    const parsed = Value.Parse(RawConfig, data)

    // Restore the original plugins if they existed
    if (originalPlugins !== undefined) {
      parsed.plugins = originalPlugins as Plugin[]
    }

    // Restore the original translators if they existed
    if (originTranslators !== undefined) {
      parsed.translators = originTranslators as Translator[]
    }

    return parsed
  } catch (error) {
    if (error instanceof Error) {
      error.message = `Invalid Config: ${error.message}`
    }
    throw error
  }
}
