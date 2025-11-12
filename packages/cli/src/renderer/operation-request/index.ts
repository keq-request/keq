import * as R from 'ramda'
import { OperationDefinition } from '~/tasks/utils/operation-definition.js'
import { typeNameFactory } from '../operation-type/index.js'
import { OpenAPIV3_1 } from '@scalar/openapi-types'
import { JsonSchemaUtils } from '~/utils/json-schema-utils/index.js'
import { SwaggerUtils } from '~/utils/swagger-utils/index.js'
import { indent } from '../utils/generate-schema.js'
import { KeqQueryOptionsFactory } from '~/types/runtime-config.js'


function errorToComment(err: unknown, mediaType: string): string {
  const $err = String(err)
    .split('\n')
    .map(((line) => ` * ${line}`))
    .join('\n')

  return [
    '/**',
    ` * Unable to dereference schema for media type ${mediaType}`,
    $err,
    ' */',
  ].join('\n')
}

interface OperationRequestRendererOptions {
  qs: KeqQueryOptionsFactory
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function operationRequestRenderer(operationDefinition: OperationDefinition, options: OperationRequestRendererOptions): Promise<string> {
  const { operation, operationId, method, pathname } = operationDefinition
  const { qs } = options

  if (!operation.responses) return ''

  const typeName = typeNameFactory(operationDefinition)
  const moduleName = operationDefinition.module.name


  const parameters = operation.parameters?.filter((p): p is OpenAPIV3_1.ParameterObject => !JsonSchemaUtils.isRef(p)) || []

  const queryParameters = parameters.filter((p) => p.in === 'query')
  const headersParameters = parameters.filter((p) => p.in === 'header')
  const pathParameters = parameters.filter((p) => p.in === 'path')
  // const cookieParameters = parameters.filter((p) => p.in === 'cookie')

  const $queryParameters = queryParameters
    .map((p) => {
      const option = qs(p)
      const $option = (!option || R.isEmpty(option)) ? '' : `, ${JSON.stringify(option)}`

      return `  if (args && ${JSON.stringify(p.name)} in args) req.query(${JSON.stringify(p.name)}, args[${JSON.stringify(p.name)}]${$option})`
    })
    .concat('')
    .join('\n')

  const $headerParameters = headersParameters
    .map((p) => `  if (args && ${JSON.stringify(p.name)} in args) req.header(${JSON.stringify(p.name)}, args[${JSON.stringify(p.name)}])`)
    .concat('')
    .join('\n')

  const $pathParameters = pathParameters
    .map((p) => `  if (args && ${JSON.stringify(p.name)} in args) req.params(${JSON.stringify(p.name)}, args[${JSON.stringify(p.name)}])`)
    .concat('')
    .join('\n')

  const requestBodyContent = (operation.requestBody?.content || {}) as Record<string, OpenAPIV3_1.MediaTypeObject>


  const $requestBody = Object.entries(requestBodyContent)
    .map(([mediaType, mediaTypeObject]): string | undefined => {
      if (!mediaTypeObject.schema) return

      try {
        const schema = JsonSchemaUtils.isRef(mediaTypeObject.schema)
          ? SwaggerUtils.dereferenceDeep<OpenAPIV3_1.SchemaObject>(mediaTypeObject.schema.$ref, operationDefinition.document.swagger)
          : mediaTypeObject.schema

        if (schema.type !== 'object') return

        const properties = (schema.properties || {}) as OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject

        return Object.entries(properties)
          .map(([propertyName, propertySchema]) => {
            const $propertyName = JSON.stringify(propertyName)

            if (mediaType === 'application/json') {
              return `  if (args && ${$propertyName} in args) req.send({ ${$propertyName}: args[${$propertyName}] })`
            } else if (mediaType === 'multipart/form-data') {
              try {
                const schema = JsonSchemaUtils.isRef(propertySchema)
                  ? SwaggerUtils.dereferenceDeep<OpenAPIV3_1.SchemaObject>(propertySchema.$ref, operationDefinition.document.swagger)
                  : propertySchema

                if (schema.type === 'string' && schema.format === 'binary' || schema.contentMediaType === 'application/octet-stream') {
                  return `  if (args && ${$propertyName} in args && args[${$propertyName}]) req.attach(${$propertyName}, args[${$propertyName}])`
                }

                return `  if (args && ${$propertyName} in args && args[${$propertyName}] !== undefined) req.field(${$propertyName}, args[${$propertyName}])`
              } catch (err) {
                return indent(2, errorToComment(err, mediaType))
              }
            } else {
              throw new Error(`Unsupported media type: ${mediaType}`)
            }
          })
          .join('\n')
      } catch (err) {
        return indent(2, errorToComment(err, mediaType))
      }
    })
    .filter(R.isNotNil)
    .join('\n')

  return [
    `const moduleName = "${moduleName}"`,
    `const method = "${method}"`,
    `const pathname = "${pathname}"`,
    '',
    `export function ${operationId}<STATUS extends keyof ${typeName('ResponseBodies')}>(args?: ${typeName('RequestParameters')}): Keq<Operation<STATUS>> {`,
    `  const req = request.post<${typeName('ResponseBodies')}[STATUS]>("${pathname}")`,
    '    .option(\'module\', { name: moduleName, pathname, method })',
    '',
    $queryParameters || undefined,
    $headerParameters || undefined,
    $pathParameters || undefined,
    $requestBody ? `${$requestBody}\n` : undefined,
    '  return req',
    '}',
    '',
    `${operationId}.pathname = pathname`,
    `${operationId}.method = method`,
  ].filter(R.isNotNil).join('\n')
}
