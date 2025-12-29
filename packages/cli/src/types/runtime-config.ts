import { KeqQueryOptions } from 'keq'
import { Static, Type } from '@sinclair/typebox'
import { OpenAPIV3_1 } from '@scalar/openapi-types'
import { FileNamingStyle } from '../constants/file-naming-style.js'
import { Qs } from './qs.js'
import { Plugin } from './plugin.js'


export const RuntimeConfig = Type.Object({
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

  modules: Type.Record(Type.String(), Type.String()),

  qs: Type.Optional(Type.Union([
    Qs,
    Type.Function([Type.Any()], Qs),
  ])),

  debug: Type.Optional(Type.Boolean({ default: false })),

  /**
   * Whether to tolerate wrong openapi/swagger structure
   */
  tolerant: Type.Optional(Type.Boolean({ default: false })),

  plugins: Type.Optional(Type.Array(Type.Any(), { default: [] })),
})


export type KeqQueryOptionsFactory = (parameter: OpenAPIV3_1.ParameterObject) => KeqQueryOptions | undefined

export interface RuntimeConfig extends Omit<Static<typeof RuntimeConfig>, 'operationId' | 'qs' | 'plugins'> {
  qs?: KeqQueryOptions | KeqQueryOptionsFactory
  plugins?: Plugin[]
}
