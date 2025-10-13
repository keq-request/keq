import * as R from 'ramda'
import { OpenAPIV3_1 } from '@scalar/openapi-types'


export function isRefDefined($ref: string, swagger: OpenAPIV3_1.Document): boolean {
  if ($ref.startsWith('#/')) {
    const path = $ref.replace('#/', '').split('/')
    return R.path(path, swagger) !== undefined
  }

  return false
}

