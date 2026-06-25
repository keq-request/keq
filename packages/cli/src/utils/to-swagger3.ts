import { OpenAPI, OpenAPIV2, OpenAPIV3 } from 'openapi-types'
import swaggerConverter from 'swagger2openapi'


export async function toSwagger3(swagger: OpenAPI.Document): Promise<OpenAPIV3.Document> {
  if (typeof swagger === 'object' && swagger['swagger'] === '2.0') {
    try {
      const result = await new Promise<any>((resolve, reject) => {
        swaggerConverter.convertObj(
          swagger as OpenAPIV2.Document,
          { patch: true, warnOnly: true },
          (err, options) => {
            if (err) reject(err)
            else resolve(options.openapi)
          }
        )
      })

      return result
    } catch (err) {
      console.error(err)
      throw new Error('The swagger file cannot be converted to OpenAPI 3.0')
    }
  }

  return swagger as OpenAPIV3.Document
}
