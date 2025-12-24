import * as R from 'ramda'
import { KeqQueryOptions } from 'keq'
import { OperationDefinition } from '~/models/index.js'
import { KeqQueryOptionsFactory } from '~/types/index.js'
import { typeNameFactory, TypeNameFn } from './utils/index.js'
import { OpenAPIV3_1 } from '@scalar/openapi-types'
import { JsonSchemaUtils } from '~/utils/json-schema-utils/index.js'
import { OpenapiUtils } from '~/utils/openapi-utils/index.js'


export interface OperationDefinitionTypescriptHelperOptions {
  esm?: boolean
  qs?: KeqQueryOptions | KeqQueryOptionsFactory
}

export class OperationDefinitionTypescriptHelper {
  typeName: TypeNameFn

  constructor(
    private readonly operationDefinition: OperationDefinition,
    private readonly options: OperationDefinitionTypescriptHelperOptions,
  ) {
    this.typeName = typeNameFactory(operationDefinition)
  }


  private getQsParameters(parameter: OpenAPIV3_1.ParameterObject): KeqQueryOptions | undefined {
    if (typeof this.options.qs === 'function') {
      return this.options.qs(parameter)
    } else if (typeof this.options.qs === 'object') {
      return this.options.qs
    }

    const style = parameter.style || 'form'
    const explode = parameter.explode ?? true

    if (style === 'deepObject') {
      return { arrayFormat: 'brackets' }
    } else if (explode) {
      return { arrayFormat: 'repeat' }
    } else {
      if (style === 'form') {
        return { arrayFormat: 'comma' }
      } else if (style === 'spaceDelimited') {
        return { arrayFormat: 'space' }
      } else if (style === 'pipeDelimited') {
        return { arrayFormat: 'pipe' }
      }
    }

    return {}
  }


  // render: "if (args && 'Authorization' in args) req.header('Authorization', args['Authorization'])"
  renderRequestHeaders(): string {
    const { operation } = this.operationDefinition

    const $headers = (operation.parameters || [])
      .filter((p): p is OpenAPIV3_1.ParameterObject => !JsonSchemaUtils.isRef(p))
      .filter((p) => p.in === 'header')
      .map((p) => `if (args && ${JSON.stringify(p.name)} in args) req.header(${JSON.stringify(p.name)}, args[${JSON.stringify(p.name)}])`)
      .join('\n')

    return $headers
  }

  // render: "if (args && 'id' in args) req.query('id', args['id'], options)"
  renderRequestQuery(): string {
    const { operation } = this.operationDefinition

    const $query = (operation.parameters || [])
      .filter((p): p is OpenAPIV3_1.ParameterObject => !JsonSchemaUtils.isRef(p))
      .filter((p) => p.in === 'query')
      .map((p) => {
        const option = this.getQsParameters(p)
        const $option = (!option || R.isEmpty(option)) ? '' : `, ${JSON.stringify(option)}`

        return `if (args && ${JSON.stringify(p.name)} in args) req.query(${JSON.stringify(p.name)}, args[${JSON.stringify(p.name)}]${$option})`
      })
      .join('\n')

    return $query
  }

  // render: "if (args && 'id' in args) req.params('id', args['id'])"
  renderRequestPathParameters(): string {
    const { operation } = this.operationDefinition

    const $pathParameters = (operation.parameters || [])
      .filter((p): p is OpenAPIV3_1.ParameterObject => !JsonSchemaUtils.isRef(p))
      .filter((p) => p.in === 'path')
      .map((p) => `if (args && ${JSON.stringify(p.name)} in args) req.params(${JSON.stringify(p.name)}, args[${JSON.stringify(p.name)}])`)
      .join('\n')

    return $pathParameters
  }

  getRequestMediaTypes(): string[] {
    const { operation } = this.operationDefinition
    const requestBodyContent = (operation.requestBody?.content || {}) as Record<string, OpenAPIV3_1.MediaTypeObject>
    return Object.keys(requestBodyContent)
  }

  // render "req.type("application/json")"
  renderMediaType(): string {
    const mediaTypes = this.getRequestMediaTypes()

    if (mediaTypes.length === 1 && !mediaTypes[0].endsWith('/*')) {
      return `req.type("${mediaTypes[0]}")\n`
    } else if (mediaTypes.some((mediaType) => mediaType === '*/*')) {
    // no-op
    } else if (mediaTypes.some((mediaType) => mediaType.endsWith('/*'))) {
      return 'if(args?.["content-type"]) req.type(args["content-type"])\n'
    } else if (mediaTypes.length > 1) {
      return 'if(args?.["content-type"]) req.type(args["content-type"])\n'
    }

    return ''
  }


  // render body

  private requestBodyFormDataPropertyRenderer(
    propertyName: string,
    propertySchema: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject,
    mediaType: string,
  ): string {
    try {
      const $propertyName = JSON.stringify(propertyName)

      const schema = JsonSchemaUtils.isRef(propertySchema)
        ? OpenapiUtils.dereferenceDeep<OpenAPIV3_1.SchemaObject>(propertySchema.$ref, this.operationDefinition.document.specification)
        : propertySchema

      if (
        (schema.type === 'string' && schema.format === 'binary')
        || schema.contentMediaType === 'application/octet-stream') {
        return `if (args && ${$propertyName} in args && args[${$propertyName}]) req.attach(${$propertyName}, args[${$propertyName}])`
      } else if (
        schema.type === 'string'
        || (schema.type === 'array' && schema.items && schema.items.type === 'string')
      ) {
        return `if (args && ${$propertyName} in args && args[${$propertyName}] !== undefined) req.field(${$propertyName}, args[${$propertyName}])`
      } else if (schema.type === 'number' || schema.type === 'integer') {
        return `if (args && ${$propertyName} in args && args[${$propertyName}] !== undefined) req.field(${$propertyName}, String(args[${$propertyName}]))`
      }

      return `if (args && ${$propertyName} in args && args[${$propertyName}] !== undefined) req.field(${$propertyName}, String(args[${$propertyName}]) /* type is non-string in schema; triggers type coercion here */)`
    } catch (err) {
      return this.renderErrorComment(err, mediaType)
    }
  }

  private requestBodyPropertyRenderer(
    propertyName: string,
    propertySchema: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject,
    mediaType: string,
  ): string {
    if (mediaType === 'application/json') {
      const $propertyName = JSON.stringify(propertyName)
      return `if (args && ${$propertyName} in args) req.send({ ${$propertyName}: args[${$propertyName}] })`
    } else if (mediaType === 'multipart/form-data') {
      return this.requestBodyFormDataPropertyRenderer(propertyName, propertySchema, mediaType)
    } else {
      throw new Error(`Unsupported media type: ${mediaType}`)
    }
  }

  renderRequestBody(): string {
    const { operation } = this.operationDefinition
    const requestBodyContent = (operation.requestBody?.content || {}) as Record<string, OpenAPIV3_1.MediaTypeObject>

    const $requestBody = Object.entries(requestBodyContent)
      .map(([mediaType, mediaTypeObject]): string | undefined => {
        if (!mediaTypeObject.schema) return

        try {
          const schema = JsonSchemaUtils.isRef(mediaTypeObject.schema)
            ? OpenapiUtils.dereferenceDeep<OpenAPIV3_1.SchemaObject>(mediaTypeObject.schema.$ref, this.operationDefinition.document.specification)
            : mediaTypeObject.schema

          if (schema.type !== 'object') return

          const properties = (schema.properties || {}) as OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject

          return Object.entries(properties)
            .map(([propertyName, propertySchema]) => this.requestBodyPropertyRenderer(propertyName, propertySchema, mediaType))
            .join('\n')
        } catch (err) {
          return this.renderErrorComment(err, mediaType)
        }
      })
      .filter(R.isNotNil)
      .join('\n')

    return $requestBody
  }

  private renderErrorComment(err: unknown, mediaType: string): string {
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
}
