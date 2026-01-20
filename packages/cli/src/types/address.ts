import { Static, Type } from '@sinclair/typebox'


export const Address = Type.Object({
  url: Type.String(),
  headers: Type.Optional(Type.Record(Type.String(), Type.String(), { default: {} })),
  encoding: Type.Optional(
    Type.Union([
      Type.Literal('utf8'),
      Type.Literal('ascii'),
    ], { default: 'utf8' }),
  ),
})

export type Address = Static<typeof Address>
