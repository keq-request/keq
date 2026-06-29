import * as R from 'ramda'
import { StaticDecode, StaticEncode, Type } from '@sinclair/typebox'
import { FileNamingStyle } from '../constants/file-naming-style.js'
import { Plugin } from './plugin.js'
import { Address } from './address.js'
import { isValidURL } from '../utils/is-valid-url.js'
import { Translator } from './index.js'


const Modules = Type.Transform(
  Type.Record(
    Type.String(),
    Type.Union([Type.String(), Address]),
  ),
)
  .Decode((value): Record<string, Address> => {
    const keys = Object.keys(value)

    for (const key of keys) {
      if (!/^[A-Za-z_][A-Za-z0-9_$]*$/.test(key)) {
        throw new Error(`Module name "${key}" is not valid. It must start with a letter or underscore, and can only contain letters, numbers, and underscores.`)
      }
    }

    const keysGroupByLowerCase = R.groupBy(R.toLower, keys)

    for (const groupKey in keysGroupByLowerCase) {
      const keys = keysGroupByLowerCase[groupKey] || []
      if (keys.length > 1) {
        throw new Error(`Module names ${keys.map((name) => `"${name}"`).join(', ')} are case-insensitively duplicated.`)
      }
    }

    for (const key in value) {
      const url = typeof value[key] === 'string' ? value[key] : value[key].url

      if (isValidURL(url)) continue

      throw new Error(`The ${JSON.stringify(url)} of module "${key}" is not a valid URL.`)
    }

    return R.map(
      (item: string | Address): Address => (typeof item !== 'string' ? item : { url: item, headers: {}, encoding: 'utf8' }),
      value,
    )
  })
  .Encode((value) => value)


export const RawConfig = Type.Object({
  /**
   * Output directory for generated files
   */
  outdir: Type.String({ default: './api' }),

  /**
   * Rendering options that directly control code generation output
   */
  rendering: Type.Object({
    /**
     * Whether to generate ES Module code
     *
     * If not specified, the module system will be inferred from the nearest package.json "type" field
     * or defaults to "cjs" if no package.json is found.
     */
    esm: Type.Optional(Type.Boolean({ default: false })),

    /**
     * File naming style for generated files
     */
    fileNamingStyle: Type.Enum(FileNamingStyle, { default: FileNamingStyle.snakeCase }),

    /**
     * Controls how `additionalProperties: true` (or undefined) is rendered in generated TypeScript types.
     *
     * - `'unknown'` (default): renders as `unknown`, which is stricter and type-safe
     * - `'any'`: renders as `any`, which is more permissive
     */
    additionalPropertiesType: Type.Optional(
      Type.Union([Type.Literal('unknown'), Type.Literal('any')], { default: 'unknown' }),
    ),

    /**
     * Whether to generate entrypoint (index) files that re-export all generated modules.
     *
     * Disable this to avoid merge conflicts in multi-branch collaborative development,
     * as auto-generated index files change frequently.
     */
    entrypoint: Type.Optional(Type.Boolean({ default: false })),
  }, { default: {} }),

  /**
   * OpenAPI/Swagger document sources
   *
   * A map of module names to their document URLs or Address objects.
   * The module name must be a valid JavaScript identifier.
   */
  modules: Modules,

  /**
   * Enable debug mode to output detailed logs during compilation
   */
  debug: Type.Optional(Type.Boolean({ default: false })),

  /**
   * Whether to tolerate wrong openapi/swagger structure
   */
  tolerant: Type.Optional(Type.Boolean({ default: false })),

  /**
   * Translators to transform generated code
   *
   * Used to customize the code generation process for different frameworks or patterns.
   * Can be a single translator or an array of translators.
   */
  translators: Type.Optional(
    Type.Transform(
      Type.Union([
        Type.Unsafe<Translator>(Type.Any()),
        Type.Array(Type.Unsafe<Translator>(Type.Any())),
      ], { default: [] }),
    )
      .Decode((value): Translator[] => {
        if (value === undefined) return []
        if (Array.isArray(value)) return value
        return [value]
      })
      .Encode((value) => value),
  ),

  /**
   * Plugins to extend code generation functionality
   *
   * An array of plugin instances that can hook into various stages of the compilation process,
   * such as code transformation, formatting, linting, or custom file generation.
   */
  plugins: Type.Optional(Type.Array(Type.Unsafe<Plugin>(Type.Any()), { default: [] })),
})

export type RawConfig = StaticEncode<typeof RawConfig>
export type RuntimeConfig = StaticDecode<typeof RawConfig>
