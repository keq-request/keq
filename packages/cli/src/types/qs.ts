import { Static, Type } from '@sinclair/typebox'
import { QsArrayFormat } from '~/constants/qs-array-format.js'


export const Qs = Type.Object({
  indices: Type.Optional(Type.Boolean()),
  arrayFormat: Type.Optional(Type.Enum(QsArrayFormat)),
  allowDots: Type.Optional(Type.Boolean()),
})

export type Qs = Static<typeof Qs>
