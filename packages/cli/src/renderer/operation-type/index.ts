import * as R from 'ramda'
import { Alias, generateSchema, indent } from '../utils/generate-schema.js'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { OperationDefinition } from '~/tasks/utils/operation-definition.js'
import * as changeCase from 'change-case'
import { JsonSchemaUtils } from '~/utils/json-schema-utils/index.js'


export function typeNameFactory(operationDefinition: OperationDefinition) {
  const pascalCaseOperationId = changeCase.pascalCase(operationDefinition.operationId)
  return (name: string) => `${pascalCaseOperationId}${name}`
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function operationTypeRenderer(operationDefinition: OperationDefinition, alias: Alias = R.identity): Promise<string> {
  const { operation } = operationDefinition

  if (!operation.responses) return ''

  // const pascalCaseOperationId = changeCase.pascalCase(operationDefinition.operationId)
  const typeName = typeNameFactory(operationDefinition)

  const $responses = Object.entries(operation.responses)
    .map(([statusCode, response]) => {
      if (!JsonSchemaUtils.isRef(response)) {
        const $value = Object.values(response.content || {})
          .map((mediaTypeObject) => mediaTypeObject.schema)
          .filter((schema) => !!schema)
          .map((schema) => generateSchema(schema, alias))
          .join(' | ')

        return indent(2, `${statusCode}: ${$value || 'void'}`)
      }
    })
    .join('\n')

  let $requestBody = `export type ${typeName('RequestBody')} = {}`

  if (operation.requestBody && !JsonSchemaUtils.isRef(operation.requestBody)) {
    const $value = Object.entries(operation.requestBody.content || {})
      .map(([mediaType, mediaTypeObject]) => <const>[mediaType, mediaTypeObject.schema])
      .filter(([, schema]) => !!schema)
      .map(([mediaType, schema]) => {
        if (mediaType === 'multipart/form-data') {
          return `FormData | ${generateSchema(schema!, alias)}`
        } else if (mediaType === 'application/x-www-form-urlencoded') {
          return `URLSearchParams | ${generateSchema(schema!, alias)}`
        }

        return generateSchema(schema!, alias)
      })
      .join(' | ')

    $requestBody = `export type ${typeName('RequestBody')} = ${$value || 'unknown'}`
  }

  return [
    `export interface ${typeName('ResponseBodies')} {`,
    $responses,
    '}',
    '',
    generateParameters(`${typeName('RequestQuery')}`, operation.parameters?.filter((p) => !JsonSchemaUtils.isRef(p) && p.in === 'query') || [], alias),
    '',
    generateParameters(`${typeName('RouteParameters')}`, operation.parameters?.filter((p) => !JsonSchemaUtils.isRef(p) && p.in === 'path') || [], alias),
    '',
    generateParameters(`${typeName('RequestHeaders')}`, operation.parameters?.filter((p) => !JsonSchemaUtils.isRef(p) && p.in === 'header') || [], alias),
    '',
    $requestBody,
    '',
    `export type ${typeName('RequestParameters')} = ${typeName('RequestQuery')} & ${typeName('RouteParameters')} & ${typeName('RequestHeaders')} & ${typeName('RequestBody')}`,
    '',
    `export interface Operation<STATUS extends keyof ${typeName('ResponseBodies')}> extends KeqOperation {`,
    `  requestParams: ${typeName('RouteParameters')} & { [key: string]: KeqParamValue }`,
    `  requestQuery: ${typeName('RequestQuery')} & { [key: string]: KeqQueryValue }`,
    `  requestHeaders: ${typeName('RequestHeaders')} & { [key: string]: string | number }`,
    `  requestBody: ${typeName('RequestBody')}`,
    `  responseBody: ${typeName('ResponseBodies')}[STATUS]`,
    '}',
  ].join('\n')
}

function generateParameters(name: string, parameters: OpenAPIV3_1.ParameterObject[], alias: Alias): string {
  if (parameters.length === 0) {
    return `export type ${name} = {}`
  }

  const $parameters = parameters.map((parameter) => {
    const parameterName = `"${parameter.name}"`
    const $key = parameter.required ? parameterName : `${parameterName}?`
    const $value = generateSchema(parameter.schema || { type: 'any' }, alias)

    return indent(2, `${$key}: ${$value}`)
  })
    .join('\n')


  return [
    `export type ${name} = {`,
    $parameters,
    '}',
  ].filter(Boolean).join('\n')
}
