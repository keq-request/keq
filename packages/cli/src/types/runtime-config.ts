import { Static, Type } from '@sinclair/typebox'
import { OperationIdFactory } from './operation-id-factory'
import { FileNamingStyle } from '../constants/file-naming-style'


export const RuntimeConfig = Type.Object({
  strict: Type.Optional(Type.Boolean({ default: false })),
  esm: Type.Optional(Type.Boolean({ default: false })),

  outdir: Type.String({ default: `${process.cwd()}/api` }),
  fileNamingStyle: Type.Enum(FileNamingStyle, { default: FileNamingStyle.snakeCase }),
  request: Type.Optional(Type.String()),
  modules: Type.Record(Type.String(), Type.String()),
  operationIdFactory: Type.Optional(Type.Function([Type.Any()], Type.String())),
  debug: Type.Optional(Type.Boolean({ default: false })),

  /**
   * Whether to tolerate wrong swagger structure
   */
  tolerant: Type.Optional(Type.Boolean({ default: false })),
})


export interface RuntimeConfig extends Omit<Static<typeof RuntimeConfig>, 'operationId'> {
  operationIdFactory?: OperationIdFactory
}
