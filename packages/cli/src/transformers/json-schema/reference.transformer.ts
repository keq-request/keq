import * as R from 'ramda'
import { OpenAPIV3_1 } from '@scalar/openapi-types'


export class ReferenceTransformer {
  static toDeclaration(schema: OpenAPIV3_1.ReferenceObject, alias: (name: string) => string = R.identity): string {
    if (!schema.$ref || !schema.$ref.startsWith('#')) return `unknown /* ${schema.$ref.replace('*/', '*\\/')} */`

    const parts: string[] = schema.$ref.split('/')
    // return parts[parts.length - 1] || 'unknown'

    return alias(parts[parts.length - 1]) || 'unknown'
  }
}
