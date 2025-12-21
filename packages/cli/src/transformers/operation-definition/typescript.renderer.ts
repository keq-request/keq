import * as R from 'ramda'
import { OperationDefinition } from '~/models/index.js'
import { Renderer } from '../types/renderer.js'
import { typeNameFactory, TypeNameFn } from './utils/index.js'
import { OpenAPIV3_1 } from '@scalar/openapi-types'
import { JsonSchemaUtils } from '~/utils/json-schema-utils/index.js'
import { OpenapiUtils } from '~/utils/openapi-utils/index.js'
import { indent } from '~/utils/indent.js'
import { KeqQueryOptionsFactory } from '~/types/runtime-config.js'
import { Exception } from '~/exception.js'


export interface OperationDefinitionTypescriptRendererOptions {
  esm?: boolean
  qs: KeqQueryOptionsFactory

  getOperationDefinitionDeclarationFilepath(operationDefinition: OperationDefinition): string
}

export class TypescriptRenderer implements Renderer {
  private typeName: TypeNameFn

  constructor(
    private readonly operationDefinition: OperationDefinition,
    private readonly options: OperationDefinitionTypescriptRendererOptions,
  ) {
    this.typeName = typeNameFactory(operationDefinition)
  }

  render(): string {
    const { operation, operationId, method, pathname } = this.operationDefinition
    if (!operation.responses) return ''

    const $dependencies = this.renderDependencies()

    const moduleName = this.operationDefinition.module.name

    const $method = method.toLowerCase()
    const $queryParameters = this.renderRequestQuery()
    const $headerParameters = this.renderRequestHeaders()
    const $pathParameters = this.renderRequestPathParameters()

    const $mediaType = this.renderMediaType()

    const $requestBody = this.renderRequestBody()

    const $operationDeclaration = this.renderOperationDeclaration()

    return [
      '/* @anchor:file:start */',
      '',
      $dependencies,
      '',
      `const moduleName = "${moduleName}"`,
      `const method = "${method}"`,
      `const pathname = "${pathname}"`,
      '',
      '/* @anchor:operation-declaration */',
      `export ${$operationDeclaration} {`,
      `  const req = request.${$method}<${this.typeName('ResponseBodies')}[STATUS]>("${pathname}")`,
      '    .option(\'module\', { name: moduleName, pathname, method })',
      '',
      $mediaType || undefined,
      '  /* @anchor:query:start */',
      $queryParameters || undefined,
      '  /* @anchor:query:end */',
      '',
      '  /* @anchor:headers:start */',
      $headerParameters || undefined,
      '  /* @anchor:headers:end */',
      '',
      '  /* @anchor:path-parameters:start */',
      $pathParameters || undefined,
      '  /* @anchor:path-parameters:end */',
      '',
      '  /* @anchor:body:start */',
      $requestBody || undefined,
      '  /* @anchor:body:end */',
      '',
      '  /* @anchor:operation-return */',
      `  return req as ReturnType<typeof ${operationId}<STATUS${$operationDeclaration.includes('CONTENT_TYPE') ? ', CONTENT_TYPE' : ''}>>`,
      '}',
      '',
      `${operationId}.pathname = pathname`,
      `${operationId}.method = method`,
      '/* @anchor:file:end */',
    ].filter(R.isNotNil).join('\n')
  }

  private renderDependencies(): string {
    const declarationFilepath = this.options.getOperationDefinitionDeclarationFilepath(this.operationDefinition)
    return [
      'import { Keq } from "keq"',
      'import { request } from "../../request"',
      `import type { Operation, ${this.typeName('ResponseBodies')}, ${this.typeName('RequestParameters')} } from "${declarationFilepath}"`,
      `export type { ${this.typeName('RequestQuery')}, ${this.typeName('RequestHeaders')}, ${this.typeName('RequestBodies')} } from "${declarationFilepath}"`,
    ]
      .map((str) => (str.replace(/ from "(\.\.?\/.+?)(\.ts|\.mts|\.cts|\.js|\.cjs|\.mjs)?"/, this.options.esm ? ' from "$1.js"' : ' from "$1"')))
      .join('\n')
  }

  // render: "if (args && 'Authorization' in args) req.header('Authorization', args['Authorization'])"
  private renderRequestHeaders(): string {
    const { operation } = this.operationDefinition

    const $headers = (operation.parameters || [])
      .filter((p): p is OpenAPIV3_1.ParameterObject => !JsonSchemaUtils.isRef(p))
      .filter((p) => p.in === 'header')
      .map((p) => `  if (args && ${JSON.stringify(p.name)} in args) req.header(${JSON.stringify(p.name)}, args[${JSON.stringify(p.name)}])`)
      .concat('')
      .join('\n')

    return $headers
  }

  // render: "if (args && 'id' in args) req.query('id', args['id'], options)"
  private renderRequestQuery(): string {
    const { operation } = this.operationDefinition

    const $query = (operation.parameters || [])
      .filter((p): p is OpenAPIV3_1.ParameterObject => !JsonSchemaUtils.isRef(p))
      .filter((p) => p.in === 'query')
      .map((p) => {
        const option = this.options.qs(p)
        const $option = (!option || R.isEmpty(option)) ? '' : `, ${JSON.stringify(option)}`

        return `  if (args && ${JSON.stringify(p.name)} in args) req.query(${JSON.stringify(p.name)}, args[${JSON.stringify(p.name)}]${$option})`
      })
      .concat('')
      .join('\n')

    return $query
  }

  // render: "if (args && 'id' in args) req.params('id', args['id'])"
  private renderRequestPathParameters(): string {
    const { operation } = this.operationDefinition

    const $pathParameters = (operation.parameters || [])
      .filter((p): p is OpenAPIV3_1.ParameterObject => !JsonSchemaUtils.isRef(p))
      .filter((p) => p.in === 'path')
      .map((p) => `  if (args && ${JSON.stringify(p.name)} in args) req.params(${JSON.stringify(p.name)}, args[${JSON.stringify(p.name)}])`)
      .concat('')
      .join('\n')

    return $pathParameters
  }

  private getRequestMediaTypes(): string[] {
    const { operation } = this.operationDefinition
    const requestBodyContent = (operation.requestBody?.content || {}) as Record<string, OpenAPIV3_1.MediaTypeObject>
    return Object.keys(requestBodyContent)
  }

  // render "req.type("application/json")"
  private renderMediaType(): string {
    const mediaTypes = this.getRequestMediaTypes()

    if (mediaTypes.length === 1 && !mediaTypes[0].endsWith('/*')) {
      return `  req.type("${mediaTypes[0]}")\n`
    } else if (mediaTypes.some((mediaType) => mediaType === '*/*')) {
    // no-op
    } else if (mediaTypes.some((mediaType) => mediaType.endsWith('/*'))) {
      return '  if(args?.["content-type"]) req.type(args["content-type"])\n'
    } else if (mediaTypes.length > 1) {
      return '  if(args?.["content-type"]) req.type(args["content-type"])\n'
    }

    return ''
  }

  private renderOperationDeclaration(): string {
    const { operationId } = this.operationDefinition

    const mediaTypes = this.getRequestMediaTypes()

    if (mediaTypes.length === 0) {
      return `function ${operationId}<STATUS extends keyof ${this.typeName('ResponseBodies')}, CONTENT_TYPE extends never = never>(args?: ${this.typeName('RequestParameters')}): Keq<Operation<STATUS, CONTENT_TYPE>>`
    } else if (mediaTypes.length === 1) {
      return `function ${operationId}<STATUS extends keyof ${this.typeName('ResponseBodies')}, CONTENT_TYPE extends ${JSON.stringify(mediaTypes[0])} = ${JSON.stringify(mediaTypes[0])}>(args?: ${this.typeName('RequestParameters')}): Keq<Operation<STATUS, CONTENT_TYPE>>`
    } else if (mediaTypes.length > 1) {
      return `function ${operationId}<STATUS extends keyof ${this.typeName('ResponseBodies')}, CONTENT_TYPE extends ${this.typeName('RequestParameters')}["content-type"]>(args?: Extract<${this.typeName('RequestParameters')}, { "content-type": CONTENT_TYPE }>): Keq<Operation<STATUS, CONTENT_TYPE>>`
    }

    throw new Exception(this.operationDefinition.module, '[operationDeclarationRenderer] Unreachable')
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

  private renderRequestBody(): string {
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
            .map(([propertyName, propertySchema]) => {
              return indent(
                2,
                this.requestBodyPropertyRenderer(propertyName, propertySchema, mediaType),
              )
            })
            .join('\n')
        } catch (err) {
          return indent(2, this.renderErrorComment(err, mediaType))
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
