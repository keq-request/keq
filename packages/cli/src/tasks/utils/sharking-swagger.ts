import * as R from 'ramda'
import { RuntimeConfig } from '~/types/runtime-config.js'
import { OperationFilter } from '~/types/operation-filter.js'
import { SupportedMethods } from '~/constants/supported-methods.js'
import { openapiShakingSync } from '@opendoc/openapi-shaking'
import { OpenAPIV3_1 } from '@scalar/openapi-types'


export function sharkingSwagger(swagger: OpenAPIV3_1.Document, filters: OperationFilter[], rc: RuntimeConfig): OpenAPIV3_1.Document | undefined {
  const isOperationIgnored = (pathname: string, method: string): boolean => {
    if (!filters.length) return false


    return filters.every((f) => {
      if (f.method && method !== f.method.toLowerCase().trim()) return true
      if (f.pathname && pathname !== f.pathname.trim()) return true

      return false
    })
  }


  const sharkedSwagger = openapiShakingSync(swagger as any, (pathname, method) => {
    if (!SupportedMethods.includes(method)) return false
    if (isOperationIgnored(pathname, method)) return false
    return true
  }, { tolerant: rc.tolerant }) as OpenAPIV3_1.Document

  if (R.isEmpty(sharkedSwagger.paths)) {
    return undefined
  }

  return sharkedSwagger
}
