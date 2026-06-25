import { OpenAPI, OpenAPIV3 } from 'openapi-types'
import { removeUnnecessaryRef } from './remove-unnecessary-ref.js'
import { toSwagger3 } from './to-swagger3.js'
import { fixSwagger } from 'swagger-fix'
import { validateSwagger3 } from './validate-swagger3.js'

export async function disinfect(moduleName: string, swagger: OpenAPI.Document): Promise<OpenAPIV3.Document> {
  const swagger2 = fixSwagger(swagger)
  /**
   * NOTE: fixSwagger should before toSwagger3
   *       because toSwagger3 will replace Chinese with random numbers
   *       which will reduce readability
   */
  const swagger3 = await toSwagger3(swagger2)

  removeUnnecessaryRef(swagger3)

  return validateSwagger3(moduleName, swagger3)
}
