import { Type, type Static } from '@sinclair/typebox'
import { BuildOptions } from './build-options.js'
import { OpenAPIV3 } from 'openapi-types'


export const CompileOptions = Type.Intersect([
  Type.Omit(BuildOptions, ['modules']),

  Type.Object({
    moduleName: Type.String(),
    document: Type.Any(),
  }),
])

// eslint-disable-next-line @typescript-eslint/no-redeclare, no-redeclare
export interface CompileOptions extends Omit<Static<typeof CompileOptions>, 'document'> {
  document: OpenAPIV3.Document
}
