import { Value } from '@sinclair/typebox/value'
import { RawConfig, RuntimeConfig, Plugin, Translator } from '~/types/index.js'


export function parseRuntimeConfig(data: unknown): RuntimeConfig {
  try {
    const record = typeof data === 'object' && data !== null
      ? data as Record<string, unknown>
      : undefined

    const originalPlugins = record && 'plugins' in record ? record.plugins : undefined
    const originalTranslators = record && 'translators' in record ? record.translators : undefined

    if (record) {
      delete record.plugins
      delete record.translators
    }

    const parsed = Value.Parse(RawConfig, data)

    if (originalPlugins !== undefined) {
      parsed.plugins = originalPlugins as Plugin[]
    }

    if (originalTranslators !== undefined) {
      parsed.translators = originalTranslators as Translator[]
    }

    return parsed
  } catch (error) {
    if (error instanceof Error) {
      error.message = `Invalid Config: ${error.message}`
    }
    throw error
  }
}
