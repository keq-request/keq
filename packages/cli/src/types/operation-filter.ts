
import { Type, type Static } from '@sinclair/typebox'


export const OperationFilter = Type.Object({
  // Only generate files of the specified operation method
  method: Type.Optional(Type.String()),
  // Only generate files of the specified operation pathname
  pathname: Type.Optional(Type.String()),
})


export type OperationFilter = Static<typeof OperationFilter>
