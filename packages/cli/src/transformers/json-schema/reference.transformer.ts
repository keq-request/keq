import * as R from 'ramda'
import { OpenAPIV3_1 } from '@scalar/openapi-types'


export class ReferenceTransformer {
  static toDeclaration(schema: OpenAPIV3_1.ReferenceObject, alias: (name: string) => string = R.identity): string {
    if (!schema.$ref || !schema.$ref.startsWith('#')) return `unknown /* ${schema.$ref.replace('*/', '*\\/')} */`

    const parts: string[] = schema.$ref.split('/')
    // return parts[parts.length - 1] || 'unknown'

    return alias(parts[parts.length - 1]) || 'unknown'
  }

  /**
   * Render the case where the $ref target does not exist
   */
  static toNotFoundDeclaration(schema: OpenAPIV3_1.ReferenceObject, hint?: string): string {
    const safeRef = schema.$ref.replace('*/', '*\\/')
    const message = hint
      ? `Cannot find $ref "${safeRef}". ${hint}`
      : `Cannot find $ref "${safeRef}"`
    return `unknown /* ${message} */`
  }

  /**
   * Render the case where the $ref format is invalid
   */
  static toInvalidDeclaration(schema: OpenAPIV3_1.ReferenceObject, hint?: string): string {
    const safeRef = schema.$ref.replace('*/', '*\\/')
    const message = hint
      ? `Invalid $ref "${safeRef}". ${hint}`
      : `Invalid $ref "${safeRef}"`
    return `unknown /* ${message} */`
  }
}
