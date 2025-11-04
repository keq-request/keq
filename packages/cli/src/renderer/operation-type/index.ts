import * as R from 'ramda'
import { isReferenceObject } from '../utils/is-reference-object.js'
import { Alias, generateSchema, indent } from '../utils/generate-schema.js'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { OperationDefinition } from '~/tasks/utils/operation-definition.js'
import * as changeCase from 'change-case'


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
      if (!isReferenceObject(response)) {
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

  if (operation.requestBody && !isReferenceObject(operation.requestBody)) {
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
    generateParameters(`${typeName('RequestQuery')}`, operation.parameters?.filter((p) => !isReferenceObject(p) && p.in === 'query') || [], 'KeqQueryValue', alias),
    '',
    generateParameters(`${typeName('RouteParameters')}`, operation.parameters?.filter((p) => !isReferenceObject(p) && p.in === 'path') || [], 'string | number', alias),
    '',
    generateParameters(`${typeName('RequestHeaders')}`, operation.parameters?.filter((p) => !isReferenceObject(p) && p.in === 'header') || [], 'string | number', alias),
    '',
    $requestBody,
    '',
    `export type ${typeName('RequestParameters')} = ${typeName('RequestQuery')} & ${typeName('RouteParameters')} & ${typeName('RequestHeaders')} & ${typeName('RequestBody')}`,
    '',
    `export interface Operation<STATUS extends keyof ${typeName('ResponseBodies')}> extends KeqOperation {`,
    `  requestParams: ${typeName('RouteParameters')}`,
    `  requestQuery: ${typeName('RequestQuery')}`,
    `  requestHeaders: ${typeName('RequestHeaders')}`,
    `  requestBody: ${typeName('RequestBody')}`,
    `  responseBody: ${typeName('ResponseBodies')}[STATUS]`,
    '}',
  ].join('\n')
}

function generateParameters(name: string, parameters: OpenAPIV3_1.ParameterObject[], additionalProperties: string, alias: Alias): string {
  if (parameters.length === 0) {
    if (additionalProperties) return `export type ${name} = {\n  [key: string]: ${additionalProperties}\n}`
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
    additionalProperties ? `  [key: string]: ${additionalProperties}` : '',
    '}',
  ].filter(Boolean).join('\n')
}
