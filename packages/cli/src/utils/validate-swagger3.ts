import { OpenAPIV3 } from 'openapi-types'
import chalk from 'chalk'
import SwaggerParser from '@apidevtools/swagger-parser'
import * as semver from 'semver'


export async function validateSwagger3(moduleName: string, swagger: OpenAPIV3.Document): Promise<OpenAPIV3.Document> {
  const swaggerParser = new SwaggerParser()

  try {
    await swaggerParser.bundle(swagger)

    if (!('openapi' in swaggerParser.api && semver.satisfies(swaggerParser.api.openapi, '^3'))) throw new Error('Only supports OpenAPI3')
    return swaggerParser.api as OpenAPIV3.Document
  } catch (e) {
    console.warn(chalk.yellow(`${moduleName} module swagger file does not conform to the swagger@3.0 standard specifications or have grammatical errors, which may cause unexpected errors`))
    return swagger
  }
}

