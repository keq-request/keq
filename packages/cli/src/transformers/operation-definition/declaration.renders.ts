import * as R from 'ramda'
import { OpenAPIV3_1 } from '@scalar/openapi-types'
import { OperationDefinition } from '~/models/index.js'
import { TypeNameFn } from './utils/index.js'
import { JsonSchemaUtils } from '~/utils/json-schema-utils/index.js'
import { indent } from '~/utils/indent.js'
import { OpenapiUtils } from '~/utils/openapi-utils/index.js'
import { JsonSchemaTransformer, JsonSchemaDeclarationRendererOptions } from '../json-schema/index.js'
import { rewriteAdditionalPropertiesForParameter } from './utils/rewrite-additional-properties-for-parameter.js'


export interface DeclarationRendersOptions {
  typeName: TypeNameFn
  jsonSchemaOptions: JsonSchemaDeclarationRendererOptions
  resolveRefResponse?: (refName: string) => string
}


export class DeclarationRenders {
  private readonly typeName: TypeNameFn
  private readonly jsonSchemaOptions: JsonSchemaDeclarationRendererOptions
  private readonly resolveRefResponse: (refName: string) => string

  constructor(
    private readonly operationDefinition: OperationDefinition,
    options: DeclarationRendersOptions,
  ) {
    this.typeName = options.typeName
    this.jsonSchemaOptions = options.jsonSchemaOptions
    this.resolveRefResponse = options.resolveRefResponse ?? ((name) => name)
  }

  renderResponseBodies(): string {
    const { operation } = this.operationDefinition

    if (!operation.responses || R.isEmpty(operation.responses)) {
      return `export interface ${this.typeName('ResponseBodies')} {}`
    }

    const $responses = Object.entries(operation.responses)
      .map(([statusCode, response]) => {
        if (JsonSchemaUtils.isRef(response)) {
          const refName = response.$ref.split('/').pop() || ''
          return indent(2, `${statusCode}: ${this.resolveRefResponse(refName)}`)
        }

        const $value = R.uniq(
          Object.entries(response.content || {})
            .map(([mediaType, mediaTypeObject]) => <const>[mediaType, mediaTypeObject.schema])
            .map(([mediaType, schema]) => {
              if (mediaType.includes('text/event-stream')) return 'ReadableStream<ServerSentEvent>'
              if (mediaType.includes('multipart/form-data')) return 'FormData'
              if (
                mediaType.startsWith('image/')
                || mediaType.startsWith('audio/')
                || mediaType.startsWith('video/')
                || mediaType.startsWith('font/')
                || mediaType === 'application/octet-stream'
                || mediaType === 'application/pdf'
              ) return 'ArrayBuffer'
              if (!schema) return 'unknown'

              return JsonSchemaTransformer.toDeclaration(schema, this.jsonSchemaOptions)
            }),
        ).join(' | ')

        return indent(2, `${statusCode}: ${$value || 'void'}`)
      })
      .join('\n')

    return [
      `export interface ${this.typeName('ResponseBodies')} {`,
      $responses,
      '}',
    ].join('\n')
  }

  renderRequestBodies(): string {
    const { operation } = this.operationDefinition
    let $requestBodies = `export interface ${this.typeName('RequestBodies')} {}`

    if (operation.requestBody && !JsonSchemaUtils.isRef(operation.requestBody)) {
      const $mediaTypes = Object.entries(operation.requestBody.content || {})
        .map(([mediaType, mediaTypeObject]) => <const>[mediaType, mediaTypeObject.schema])
        .map(([mediaType, schema]) => {
          if (!schema) return `${JSON.stringify(mediaType)}: unknown`
          return `${JSON.stringify(mediaType)}: ${JsonSchemaTransformer.toDeclaration(schema, this.jsonSchemaOptions)}`
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

  renderParameterBodies(): string {
    const { operation } = this.operationDefinition

    if (operation.requestBody && !JsonSchemaUtils.isRef(operation.requestBody)) {
      const $mediaTypes = Object.entries(operation.requestBody.content || {})
        .map(([mediaType, mediaTypeObject]) => <const>[mediaType, mediaTypeObject.schema])
        .map(([mediaType, schemaOrRef]) => {
          if (!schemaOrRef) return `${JSON.stringify(mediaType)}: unknown`

          const schema = JsonSchemaUtils.isRef(schemaOrRef)
            ? OpenapiUtils.dereferenceDeep<OpenAPIV3_1.SchemaObject>(schemaOrRef.$ref, this.operationDefinition.document.specification)
            : schemaOrRef

          if (schema.type === 'object' || schema.properties) {
            return `${JSON.stringify(mediaType)}: ${JsonSchemaTransformer.toDeclaration(schemaOrRef, this.jsonSchemaOptions)} & { [key: string]: any }`
          }

          return `${JSON.stringify(mediaType)}: { [key: string]: any }`
        })
        .map((pair) => indent(2, pair))

      return [
        `interface ${this.typeName('ParameterBodies')} {`,
        ...$mediaTypes,
        '}',
        '',
      ].join('\n')
    }

    return ''
  }

  renderRequestParameters(): string {
    const { operation } = this.operationDefinition

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

  renderParameters(name: string, parameters: OpenAPIV3_1.ParameterObject[]): string {
    if (parameters.length === 0) {
      return `export type ${name} = {}`
    }

    const $parameters = parameters.map((parameter) => {
      const parameterName = `"${parameter.name}"`
      const $key = parameter.required ? parameterName : `${parameterName}?`
      const schema = parameter.schema
        ? rewriteAdditionalPropertiesForParameter(parameter.schema, parameter.in!)
        : { type: 'any' as const }
      const $value = JsonSchemaTransformer.toDeclaration(schema, this.jsonSchemaOptions)

      return indent(2, `${$key}: ${$value}`)
    })
      .join('\n')

    return [
      `export type ${name} = {`,
      $parameters,
      '}',
    ].filter(Boolean).join('\n')
  }

  renderFileComment(): string {
    const { operation, method, pathname } = this.operationDefinition

    const lines: string[] = ['//']

    if (operation.deprecated) {
      lines.push('// This API has been deprecated.')
      lines.push('//')
    }

    lines.push(`// Method: ${method.toUpperCase()}`)
    lines.push(`// Pathname: ${pathname}`)

    if (operation.summary && typeof operation.summary === 'string') {
      const summary = operation.summary
        .trim()
        .replace(/\t/g, '  ')
        .replace(/\r\n?/g, '\n')

      lines.push(`// Summary: ${summary.split('\n')[0]}`)
      for (const line of summary.split('\n').slice(1)) {
        lines.push(`//   ${line.trimEnd()}`)
      }
    }

    if (operation.description && typeof operation.description === 'string') {
      const description = operation.description
        .trim()
        .replace(/\t/g, '  ')
        .replace(/\r\n?/g, '\n')

      lines.push(`// Description: ${description.split('\n')[0]}`)
      for (const line of description.split('\n').slice(1)) {
        lines.push(`//   ${line.trimEnd()}`)
      }
    }

    if (operation.tags && operation.tags.length > 0) {
      lines.push(`// Tags: ${operation.tags.join(', ')}`)
    }

    return lines.join('\n')
  }

  renderOperationInterface(): string {
    const $parameterBodies = this.renderParameterBodies()

    return [
      `export interface ${this.typeName('Operation')}<STATUS extends keyof ${this.typeName('ResponseBodies')}, CONTENT_TYPE extends ${$parameterBodies ? `keyof ${this.typeName('ParameterBodies')}` : 'string'} > extends KeqOperation {`,
      `  requestParams: ${this.typeName('RouteParameters')} & { [key: string]: KeqPathParameterInit }`,
      `  requestQuery: ${this.typeName('RequestQuery')} & { [key: string]: KeqQueryInit }`,
      `  requestHeaders: ${this.typeName('RequestHeaders')} & { [key: string]: string | number }`,
      `  requestBody: ${$parameterBodies ? `${this.typeName('ParameterBodies')}[CONTENT_TYPE] | ` : 'object | '}BodyInit`,
      `  responseBody: ${this.typeName('ResponseBodies')}[STATUS]`,
      '}',
    ].join('\n')
  }
}
