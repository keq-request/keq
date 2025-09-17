import { Type, type Static } from '@sinclair/typebox'
import { FileNamingStyle } from './file-naming-style'
import { OpenAPIV3 } from 'openapi-types'


export const BuildOptions = Type.Object({
  strict: Type.Optional(Type.Boolean({ default: false })),
  esm: Type.Optional(Type.Boolean({ default: false })),

  outdir: Type.String({ default: `${process.cwd()}/api` }),
  fileNamingStyle: Type.Enum(FileNamingStyle, { default: FileNamingStyle.snakeCase }),
  request: Type.Optional(Type.String()),


  modules: Type.Record(Type.String(), Type.Any()),
})

// eslint-disable-next-line @typescript-eslint/no-redeclare, no-redeclare
export interface BuildOptions extends Omit<Static<typeof BuildOptions>, 'operationId' | 'modules'> {
  modules: Record<string, OpenAPIV3.Document>
}
