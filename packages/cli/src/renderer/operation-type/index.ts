import * as R from 'ramda'
import { Alias, generateSchema, indent } from '../utils/generate-schema.js'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { OperationDefinition } from '~/tasks/utils/operation-definition.js'
import * as changeCase from 'change-case'
import { JsonSchemaUtils } from '~/utils/json-schema-utils/index.js'
import { SwaggerUtils } from '~/utils/swagger-utils/index.js'


export type TypeNameFn = (name: string) => string

export function typeNameFactory(operationDefinition: OperationDefinition): TypeNameFn {
  const pascalCaseOperationId = changeCase.pascalCase(operationDefinition.operationId)
  return (name: string) => `${pascalCaseOperationId}${name}`
}

function responseBodies(operation: OpenAPIV3_1.OperationObject, alias: Alias = R.identity, typeName: TypeNameFn): string {
  if (!operation.responses || R.isEmpty(operation.responses)) {
    return `export interface ${typeName('ResponseBodies')} {}`
  }

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

  return [
    `export interface ${typeName('ResponseBodies')} {`,
    $responses,
    '}',
  ].join('\n')
}

function requestBodies(operation: OpenAPIV3_1.OperationObject, alias: Alias = R.identity, typeName: TypeNameFn): string {
  let $requestBodies = `export interface ${typeName('RequestBodies')} {}`

  if (operation.requestBody && !JsonSchemaUtils.isRef(operation.requestBody)) {
    const $mediaTypes = Object.entries(operation.requestBody.content || {})
      .map(([mediaType, mediaTypeObject]) => <const>[mediaType, mediaTypeObject.schema])
      .map(([mediaType, schema]) => {
        if (!schema) return `${JSON.stringify(mediaType)}: unknown`

        // if (mediaType === 'multipart/form-data') {
        //   return `${JSON.stringify(mediaType)}: FormData | ${generateSchema(schema, alias)}`
        // } else if (mediaType === 'application/x-www-form-urlencoded') {
        //   return `${JSON.stringify(mediaType)}: URLSearchParams | ${generateSchema(schema, alias)}`
        // }

        return `${JSON.stringify(mediaType)}: ${generateSchema(schema, alias)}`
      })
      .map((pair) => indent(2, pair))

    $requestBodies = [
      `export interface ${typeName('RequestBodies')} {`,
      ...$mediaTypes,
      '}',
    ].join('\n')
  }

  return $requestBodies
}

function parameterBodies(operationDefinition: OperationDefinition, alias: Alias = R.identity, typeName: TypeNameFn): string {
  const { operation } = operationDefinition
  let parameterBodies = ''
  // let parameterBodies = `interface ${typeName('ParameterBodies')} {}`

  if (operation.requestBody && !JsonSchemaUtils.isRef(operation.requestBody)) {
    const $mediaTypes = Object.entries(operation.requestBody.content || {})
      .map(([mediaType, mediaTypeObject]) => <const>[mediaType, mediaTypeObject.schema])
      // .filter((pair): pair is [string, OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject] => !!pair[1])
      .map(([mediaType, schemaOrRef]) => {
        if (!schemaOrRef) return `${JSON.stringify(mediaType)}: unknown`

        const schema = JsonSchemaUtils.isRef(schemaOrRef)
          ? SwaggerUtils.dereferenceDeep<OpenAPIV3_1.SchemaObject>(schemaOrRef.$ref, operationDefinition.document.swagger)
          : schemaOrRef

        if (schema.type === 'object' || schema.properties) {
          return `${JSON.stringify(mediaType)}: ${generateSchema(schemaOrRef, alias)} & { [key: string]: any }`
        }

        return `${JSON.stringify(mediaType)}: { [key: string]: any }`
      })
      .map((pair) => indent(2, pair))

    // $requestBodies = `export type ${typeName('RequestBody')} = ${$value || 'unknown'}`
    parameterBodies = [
      `interface ${typeName('ParameterBodies')} {`,
      ...$mediaTypes,
      '}',
      '',
    ].join('\n')
  }

  return parameterBodies
}


function requestParameters(operation: OpenAPIV3_1.OperationObject, alias: Alias = R.identity, typeName: TypeNameFn): string {
  const mediaTypes = operation.requestBody && !JsonSchemaUtils.isRef(operation.requestBody)
    ? Object.keys(operation.requestBody.content || {})
    : []

  const base = `${typeName('RequestQuery')} & ${typeName('RouteParameters')} & ${typeName('RequestHeaders')}`

  if (mediaTypes.length === 1) {
    return `export type ${typeName('RequestParameters')} = ${base} & ${typeName('RequestBodies')}[${JSON.stringify(mediaTypes[0])}]`
  }

  if (mediaTypes.length > 1) {
    const unions = mediaTypes
      .map((mediaType) => `(${base} & ${typeName('RequestBodies')}[${JSON.stringify(mediaType)}] & { "content-type": ${JSON.stringify(mediaType)} })`)
      .join('\n| ')

    return `export type ${typeName('RequestParameters')} = ${unions}`
  }

  return `export type ${typeName('RequestParameters')} = ${base}`
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function operationTypeRenderer(operationDefinition: OperationDefinition, alias: Alias = R.identity): Promise<string> {
  const { operation } = operationDefinition

  if (!operation.responses) return ''

  // const pascalCaseOperationId = changeCase.pascalCase(operationDefinition.operationId)
  const typeName = typeNameFactory(operationDefinition)

  const $responseBodies = responseBodies(operation, alias, typeName)
  const $requestBodies = requestBodies(operation, alias, typeName)
  const $parameterBodies = parameterBodies(operationDefinition, alias, typeName)
  const $requestParameters = requestParameters(operation, alias, typeName)


  return [
    '/* @anchor:file:start */',
    '',
    $responseBodies,
    '',
    $requestBodies,
    '',
    generateParameters(`${typeName('RequestQuery')}`, operation.parameters?.filter((p) => !JsonSchemaUtils.isRef(p) && p.in === 'query') || [], alias),
    '',
    generateParameters(`${typeName('RouteParameters')}`, operation.parameters?.filter((p) => !JsonSchemaUtils.isRef(p) && p.in === 'path') || [], alias),
    '',
    generateParameters(`${typeName('RequestHeaders')}`, operation.parameters?.filter((p) => !JsonSchemaUtils.isRef(p) && p.in === 'header') || [], alias),
    '',
    $parameterBodies || undefined,
    $requestParameters,
    '',
    `export interface Operation<STATUS extends keyof ${typeName('ResponseBodies')}, CONTENT_TYPE extends keyof ${typeName('ParameterBodies')}> extends KeqOperation {`,
    `  requestParams: ${typeName('RouteParameters')} & { [key: string]: KeqPathParameterInit }`,
    `  requestQuery: ${typeName('RequestQuery')} & { [key: string]: KeqQueryInit }`,
    `  requestHeaders: ${typeName('RequestHeaders')} & { [key: string]: string | number }`,
    `  requestBody: ${$parameterBodies ? `${typeName('ParameterBodies')}[CONTENT_TYPE] | ` : 'object | '}BodyInit`,
    `  responseBody: ${typeName('ResponseBodies')}[STATUS]`,
    '}',
    '',
    '/* @anchor:file:end */',
  ].filter(R.isNotNil).join('\n')
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
