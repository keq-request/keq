import * as R from 'ramda'
import { OpenAPIV3_1 } from '@scalar/openapi-types'
import { OperationDefinition, SchemaDefinition } from '~/models/index.js'
import { typeNameFactory, TypeNameFn } from './utils/index.js'
import { JsonSchemaUtils } from '~/utils/json-schema-utils/index.js'
import { indent } from '~/utils/indent.js'
import { OpenapiUtils } from '~/utils/openapi-utils/index.js'
import { JsonSchemaTransformer, JsonSchemaDeclarationRendererOptions, ReferenceTransformer } from '../json-schema/index.js'
import { Renderer } from '../types/renderer.js'


export interface OperationDefinitionDeclarationRendererOptions {
  esm?: boolean

  getDependentSchemaDefinitionFilepath(dependentSchemaDefinition: SchemaDefinition): string
}

const alias = (name: string): string => `${name}Schema`

export class DeclarationRenderer implements Renderer {
  private typeName: TypeNameFn

  constructor(
    private readonly operationDefinition: OperationDefinition,
    private readonly options: OperationDefinitionDeclarationRendererOptions,
  ) {
    this.typeName = typeNameFactory(operationDefinition)
  }

  private renderResponseBodies(operation: OpenAPIV3_1.OperationObject, options: JsonSchemaDeclarationRendererOptions): string {
    if (!operation.responses || R.isEmpty(operation.responses)) {
      return `export interface ${this.typeName('ResponseBodies')} {}`
    }

    const $responses = Object.entries(operation.responses)
      .map(([statusCode, response]) => {
        if (!JsonSchemaUtils.isRef(response)) {
          const $value = Object.entries(response.content || {})
            .map(([mediaType, mediaTypeObject]) => <const>[mediaType, mediaTypeObject.schema])
            .map(([mediaType, schema]) => {
              if (mediaType.includes('text/event-stream')) return 'ReadableStream<ServerSentEvent>'
              if (mediaType.includes('multipart/form-data')) return 'FormData'
              if (!schema) return 'unknown'

              return JsonSchemaTransformer.toDeclaration(schema, options)
            })
            .join(' | ')

          return indent(2, `${statusCode}: ${$value || 'void'}`)
        }
      })
      .join('\n')

    return [
      `export interface ${this.typeName('ResponseBodies')} {`,
      $responses,
      '}',
    ].join('\n')
  }

  private renderRequestBodies(operation: OpenAPIV3_1.OperationObject, options: JsonSchemaDeclarationRendererOptions): string {
    let $requestBodies = `export interface ${this.typeName('RequestBodies')} {}`

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

          return `${JSON.stringify(mediaType)}: ${JsonSchemaTransformer.toDeclaration(schema, options)}`
        })
        .map((pair) => indent(2, pair))

      $requestBodies = [
        `export interface ${this.typeName('RequestBodies')} {`,
        ...$mediaTypes,
        '}',
      ].join('\n')
    }

    return $requestBodies
  }

  private renderParameterBodies(operationDefinition: OperationDefinition, options: JsonSchemaDeclarationRendererOptions): string {
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
            ? OpenapiUtils.dereferenceDeep<OpenAPIV3_1.SchemaObject>(schemaOrRef.$ref, operationDefinition.document.specification)
            : schemaOrRef

          if (schema.type === 'object' || schema.properties) {
            return `${JSON.stringify(mediaType)}: ${JsonSchemaTransformer.toDeclaration(schemaOrRef, options)} & { [key: string]: any }`
          }

          return `${JSON.stringify(mediaType)}: { [key: string]: any }`
        })
        .map((pair) => indent(2, pair))

      // $requestBodies = `export type ${typeName('RequestBody')} = ${$value || 'unknown'}`
      parameterBodies = [
        `interface ${this.typeName('ParameterBodies')} {`,
        ...$mediaTypes,
        '}',
        '',
      ].join('\n')
    }

    return parameterBodies
  }

  private renderRequestParameters(operation: OpenAPIV3_1.OperationObject, options: JsonSchemaDeclarationRendererOptions): string {
    const mediaTypes = operation.requestBody && !JsonSchemaUtils.isRef(operation.requestBody)
      ? Object.keys(operation.requestBody.content || {})
      : []

    const base = `${this.typeName('RequestQuery')} & ${this.typeName('RouteParameters')} & ${this.typeName('RequestHeaders')}`

    if (mediaTypes.length === 1) {
      return `export type ${this.typeName('RequestParameters')} = ${base} & ${this.typeName('RequestBodies')}[${JSON.stringify(mediaTypes[0])}]`
    }

    if (mediaTypes.length > 1) {
      const unions = mediaTypes
        .map((mediaType) => `(${base} & ${this.typeName('RequestBodies')}[${JSON.stringify(mediaType)}] & { "content-type": ${JSON.stringify(mediaType)} })`)
        .join('\n| ')

      return `export type ${this.typeName('RequestParameters')} = ${unions}`
    }

    return `export type ${this.typeName('RequestParameters')} = ${base}`
  }

  private rendererParameters(name: string, parameters: OpenAPIV3_1.ParameterObject[], options: JsonSchemaDeclarationRendererOptions): string {
    if (parameters.length === 0) {
      return `export type ${name} = {}`
    }

    const $parameters = parameters.map((parameter) => {
      const parameterName = `"${parameter.name}"`
      const $key = parameter.required ? parameterName : `${parameterName}?`
      const $value = JsonSchemaTransformer.toDeclaration(parameter.schema || { type: 'any' }, options)

      return indent(2, `${$key}: ${$value}`)
    })
      .join('\n')


    return [
      `export type ${name} = {`,
      $parameters,
      '}',
    ].filter(Boolean).join('\n')
  }

  private renderDependencies(): string {
    const schemaDefinitions = this.operationDefinition.getDependencies()
      .filter((schemaDefinition) => !SchemaDefinition.isUnknown(schemaDefinition))

    const $schemaDefinitions = schemaDefinitions
      .map((schemaDefinition) => {
        const filepath = this.options.getDependentSchemaDefinitionFilepath(schemaDefinition)
        const schemaName = schemaDefinition.name

        return `import type { ${schemaName} as ${alias(schemaName)} } from "${filepath}"`
      })
      .map((str) => (str.replace(/ from "(\.\.?\/.+?)(\.ts|\.mts|\.cts|\.js|\.cjs|\.mjs)?"/, this.options.esm ? ' from "$1.js"' : ' from "$1"')))

    return [
      'import type { KeqOperation, KeqPathParameterInit, KeqQueryInit, ServerSentEvent } from "keq"',
      ...$schemaDefinitions,
    ].join('\n')
  }

  render(): string {
    const { operation } = this.operationDefinition

    if (!operation.responses) return ''

    const jsonSchemaDeclarationRendererOptions: JsonSchemaDeclarationRendererOptions = {
      referenceTransformer: (schema: OpenAPIV3_1.ReferenceObject) => {
        return ReferenceTransformer.toDeclaration(schema, alias)
      },
    }

    const $dependencies = this.renderDependencies()

    const $responseBodies = this.renderResponseBodies(operation, jsonSchemaDeclarationRendererOptions)
    const $requestBodies = this.renderRequestBodies(operation, jsonSchemaDeclarationRendererOptions)
    const $parameterBodies = this.renderParameterBodies(this.operationDefinition, jsonSchemaDeclarationRendererOptions)
    const $requestParameters = this.renderRequestParameters(operation, jsonSchemaDeclarationRendererOptions)
    const $requestQuery = this.rendererParameters(
      `${this.typeName('RequestQuery')}`,
      operation.parameters?.filter((p) => !JsonSchemaUtils.isRef(p) && p.in === 'query') || [],
      jsonSchemaDeclarationRendererOptions,
    )
    const $routeParameters = this.rendererParameters(
      `${this.typeName('RouteParameters')}`,
      operation.parameters?.filter((p) => !JsonSchemaUtils.isRef(p) && p.in === 'path') || [],
      jsonSchemaDeclarationRendererOptions,
    )
    const $requestHeaders = this.rendererParameters(
      `${this.typeName('RequestHeaders')}`,
      operation.parameters?.filter((p) => !JsonSchemaUtils.isRef(p) && p.in === 'header') || [],
      jsonSchemaDeclarationRendererOptions,
    )

    return [
      '/* @anchor:file:start */',
      '',
      $dependencies,
      '',
      $responseBodies,
      '',
      $requestBodies,
      '',
      $requestQuery,
      '',
      $routeParameters,
      '',
      $requestHeaders,
      '',
      $parameterBodies || undefined,
      $requestParameters,
      '',
      `export interface ${this.typeName('Operation')}<STATUS extends keyof ${this.typeName('ResponseBodies')}, CONTENT_TYPE extends ${$parameterBodies ? `keyof ${this.typeName('ParameterBodies')}` : 'string'} > extends KeqOperation {`,
      `  requestParams: ${this.typeName('RouteParameters')} & { [key: string]: KeqPathParameterInit }`,
      `  requestQuery: ${this.typeName('RequestQuery')} & { [key: string]: KeqQueryInit }`,
      `  requestHeaders: ${this.typeName('RequestHeaders')} & { [key: string]: string | number }`,
      `  requestBody: ${$parameterBodies ? `${this.typeName('ParameterBodies')}[CONTENT_TYPE] | ` : 'object | '}BodyInit`,
      `  responseBody: ${this.typeName('ResponseBodies')}[STATUS]`,
      '}',
      '',
      '/* @anchor:file:end */',
    ].filter(R.isNotNil).join('\n')
  }
}
