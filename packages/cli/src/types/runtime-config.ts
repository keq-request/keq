import * as R from 'ramda'
import { StaticDecode, StaticEncode, Type } from '@sinclair/typebox'
import { FileNamingStyle } from '../constants/file-naming-style.js'
import { Plugin } from './plugin.js'
import { Address } from './address.js'
import { isValidURL } from '../utils/is-valid-url.js'


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
  mode: Type.Optional(
    Type.Union([
      Type.Literal('micro-function'),
      Type.Literal('nestjs-module'),
      Type.Literal('none'),
    ], { default: 'micro-function' }),
  ),

  /**
   * Whether to generate ES Module code
   *
   * If not specified, the module system will be inferred from the nearest package.json "type" field
   * or defaults to "cjs" if no package.json is found.
   */
  esm: Type.Optional(Type.Boolean({ default: false })),

  /**
   * Output directory for generated files
   */
  outdir: Type.String({ default: `${process.cwd()}/api` }),

  /**
   * File naming style for generated files
   */
  fileNamingStyle: Type.Enum(FileNamingStyle, { default: FileNamingStyle.snakeCase }),

  modules: Modules,

  debug: Type.Optional(Type.Boolean({ default: false })),

  /**
   * Whether to tolerate wrong openapi/swagger structure
   */
  tolerant: Type.Optional(Type.Boolean({ default: false })),

  plugins: Type.Optional(Type.Array(Type.Unsafe<Plugin>(Type.Any()), { default: [] })),
})

export type RawConfig = StaticEncode<typeof RawConfig>
export type RuntimeConfig = StaticDecode<typeof RawConfig>
