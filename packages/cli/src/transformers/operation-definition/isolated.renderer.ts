import * as R from 'ramda'
import { OpenAPIV3_1 } from '@scalar/openapi-types'
import { OperationDefinition, SchemaDefinition } from '~/models/index.js'
import { typeNameFactory, TypeNameFn } from './utils/index.js'
import { JsonSchemaUtils } from '~/utils/json-schema-utils/index.js'
import { JsonSchemaTransformer, JsonSchemaDeclarationRendererOptions, ReferenceTransformer } from '../json-schema/index.js'
import { Renderer } from '../types/renderer.js'
import { toSafeIdentifier } from '~/utils/to-safe-identifier.js'
import { CommentRenderer } from './comment.renderer.js'
import { OperationDefinitionSnippet, OperationDefinitionSnippetOptions } from './typescript-snippet.js'
import { Exception } from '~/exception.js'
import { DeclarationRenders } from './declaration.renders.js'
import { indent } from '~/utils/indent.js'


export interface OperationDefinitionIsolatedRendererOptions extends OperationDefinitionSnippetOptions {
  additionalPropertiesType?: 'unknown' | 'any'
  v2Compat?: boolean
  getRequestFilepath(): string
}


export class IsolatedRenderer implements Renderer {
  private typeName: TypeNameFn
  private helper: OperationDefinitionSnippet
  private renders: DeclarationRenders

  constructor(
    private readonly operationDefinition: OperationDefinition,
    private readonly options: OperationDefinitionIsolatedRendererOptions,
  ) {
    this.typeName = typeNameFactory(operationDefinition)
    this.helper = new OperationDefinitionSnippet(operationDefinition, options)

    const hint = `Referenced from operation "${operationDefinition.method.toUpperCase()} ${operationDefinition.pathname}".`
    const jsonSchemaOptions: JsonSchemaDeclarationRendererOptions = {
      referenceTransformer: (schema: OpenAPIV3_1.ReferenceObject) => {
        if (schema.$ref && schema.$ref.startsWith('#') && !operationDefinition.document.isRefDefined(schema.$ref)) {
          return ReferenceTransformer.toNotFoundDeclaration(schema, hint)
        }

        return ReferenceTransformer.toDeclaration(schema)
      },
      additionalPropertiesType: options.additionalPropertiesType,
    }

    this.renders = new DeclarationRenders(operationDefinition, {
      typeName: this.typeName,
      jsonSchemaOptions,
    })
  }

  private get operationId(): string {
    return toSafeIdentifier(this.operationDefinition.operationId)
  }

  render(): string {
    const { operation } = this.operationDefinition
    if (!operation.responses) return ''

    const parameters = operation.parameters?.filter((p): p is OpenAPIV3_1.ParameterObject => !JsonSchemaUtils.isRef(p)) || []

    const $imports = this.renderImports()
    const $inlineSchemas = this.renderInlineSchemas()
    const $responseBodies = this.renders.renderResponseBodies()
    const $requestBodies = this.renders.renderRequestBodies()
    const $parameterBodies = this.renders.renderParameterBodies()
    const $requestParameters = this.renders.renderRequestParameters()
    const $requestQuery = this.renders.renderParameters(
      `${this.typeName('RequestQuery')}`,
      parameters.filter((p) => p.in === 'query'),
    )
    const $routeParameters = this.renders.renderParameters(
      `${this.typeName('RouteParameters')}`,
      parameters.filter((p) => p.in === 'path'),
    )
    const $requestHeaders = this.renders.renderParameters(
      `${this.typeName('RequestHeaders')}`,
      parameters.filter((p) => p.in === 'header'),
    )
    const $operationInterface = this.renders.renderOperationInterface()
    const $function = this.renderFunction()
    const $fileComment = this.renders.renderFileComment()

    return [
      $fileComment,
      '',
      '/* @anchor:file:start */',
      '',
      $imports,
      '',
      $inlineSchemas || undefined,
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
      $operationInterface,
      '',
      $function,
      '',
      '/* @anchor:file:end */',
    ].filter(R.isNotNil).join('\n')
  }

  private renderImports(): string {
    const requestFilepath = this.options.getRequestFilepath()

    return [
      'import { Keq } from "keq"',
      'import type { KeqOperation, KeqPathParameterInit, KeqQueryInit, ServerSentEvent } from "keq"',
      `import { request } from "${requestFilepath}"`,
    ]
      .map((str) => (str.replace(/ from "(\.\.?\/.+?)(\.ts|\.mts|\.cts|\.js|\.cjs|\.mjs)?"/, this.options.esm ? ' from "$1.js"' : ' from "$1"')))
      .join('\n')
  }

  private renderInlineSchemas(): string {
    const schemaDeps = this.collectAllSchemaDependencies()

    if (schemaDeps.length === 0) return ''

    const rendered = schemaDeps.map((schemaDefinition) => {
      return this.renderSingleSchema(schemaDefinition)
    })

    return rendered.join('\n\n') + '\n'
  }

  private renderSingleSchema(schemaDefinition: SchemaDefinition): string {
    const referenceTransformer = (schema: OpenAPIV3_1.ReferenceObject): string => {
      const hint = `Referenced from schema definition "${schemaDefinition.name}".`
      if (!schema.$ref || !schema.$ref.startsWith('#')) {
        return ReferenceTransformer.toInvalidDeclaration(schema, hint)
      }

      if (!schemaDefinition.document.isRefDefined(schema.$ref)) {
        return ReferenceTransformer.toNotFoundDeclaration(schema, hint)
      }

      return ReferenceTransformer.toDeclaration(schema)
    }

    const options: JsonSchemaDeclarationRendererOptions = {
      referenceTransformer,
      additionalPropertiesType: this.options.additionalPropertiesType,
    }

    let $comment = JsonSchemaTransformer.toComment(schemaDefinition.schema)
    if ($comment) $comment += '\n'

    if (typeof schemaDefinition.schema === 'boolean') {
      return `${$comment ? $comment : ''}type ${schemaDefinition.name} = unknown`
    }

    if (JsonSchemaUtils.isNonArray(schemaDefinition.schema) && schemaDefinition.schema.type === 'object') {
      const $schema = JsonSchemaTransformer.toDeclaration(schemaDefinition.schema, options)
      if ($schema.startsWith('{')) {
        return `${$comment ? $comment : ''}interface ${schemaDefinition.name} ${$schema}`
      }
      return `${$comment ? $comment : ''}type ${schemaDefinition.name} = ${$schema}`
    }

    return `${$comment ? $comment : ''}type ${schemaDefinition.name} = ${JsonSchemaTransformer.toDeclaration(schemaDefinition.schema, options)}`
  }

  private collectAllSchemaDependencies(): SchemaDefinition[] {
    const collected = new Map<string, SchemaDefinition>()
    const queue = [...this.operationDefinition.getDependencies()]

    while (queue.length > 0) {
      const current = queue.shift()!
      if (SchemaDefinition.isUnknown(current)) continue
      if (collected.has(current.id)) continue

      collected.set(current.id, current)

      for (const dep of current.getDependencies()) {
        if (!SchemaDefinition.isUnknown(dep) && !collected.has(dep.id)) {
          queue.push(dep)
        }
      }
    }

    return Array.from(collected.values())
  }

  private renderFunction(): string {
    const { method, pathname } = this.operationDefinition
    const operationId = this.operationId

    const $comment = new CommentRenderer(this.operationDefinition).render()

    const $method = method.toLowerCase()
    const $queryParameters = this.helper.renderRequestQuery()
    const $headerParameters = this.helper.renderRequestHeaders()
    const $pathParameters = this.helper.renderRequestPathParameters()
    const $mediaType = this.helper.renderMediaType()
    const $requestBody = this.helper.renderRequestBody()
    const $operationDeclaration = this.renderOperationDeclaration()

    return [
      this.options.v2Compat ? `const moduleName = "${this.operationDefinition.module.name}"` : undefined,
      `const method = "${method}"`,
      `const pathname = "${pathname}"`,
      '',
      $comment || undefined,
      `export ${$operationDeclaration} {`,
      `  const req = request.${$method}<${this.typeName('ResponseBodies')}[STATUS]>("${pathname}")`,
      this.options.v2Compat ? '    .option(\'module\', { name: moduleName, pathname, method })' : undefined,
      '',
      $mediaType ? indent(2, $mediaType) : undefined,
      '  /* @anchor:query:start */',
      $queryParameters ? indent(2, $queryParameters) : undefined,
      '  /* @anchor:query:end */',
      '',
      '  /* @anchor:headers:start */',
      $headerParameters ? indent(2, $headerParameters) : undefined,
      '  /* @anchor:headers:end */',
      '',
      '  /* @anchor:path-parameters:start */',
      $pathParameters ? indent(2, $pathParameters) : undefined,
      '  /* @anchor:path-parameters:end */',
      '',
      '  /* @anchor:body:start */',
      $requestBody ? indent(2, $requestBody) : undefined,
      '  /* @anchor:body:end */',
      '',
      '  /* @anchor:operation-return */',
      `  return req as ReturnType<typeof ${operationId}<STATUS${$operationDeclaration.includes('CONTENT_TYPE') ? ', CONTENT_TYPE' : ''}>>`,
      '}',
      '',
      `${operationId}.pathname = pathname`,
      `${operationId}.method = method`,
    ].filter(R.isNotNil).join('\n')
  }

  private renderOperationDeclaration(): string {
    const operationId = this.operationId
    const mediaTypes = this.helper.getRequestMediaTypes()

    if (mediaTypes.length === 0) {
      return `function ${operationId}<STATUS extends keyof ${this.typeName('ResponseBodies')}, CONTENT_TYPE extends never = never>(args?: ${this.typeName('RequestParameters')}): Keq<${this.typeName('Operation')}<STATUS, CONTENT_TYPE>>`
    } else if (mediaTypes.length === 1) {
      return `function ${operationId}<STATUS extends keyof ${this.typeName('ResponseBodies')}, CONTENT_TYPE extends ${JSON.stringify(mediaTypes[0])} = ${JSON.stringify(mediaTypes[0])}>(args?: ${this.typeName('RequestParameters')}): Keq<${this.typeName('Operation')}<STATUS, CONTENT_TYPE>>`
    } else if (mediaTypes.length > 1) {
      return `function ${operationId}<STATUS extends keyof ${this.typeName('ResponseBodies')}, CONTENT_TYPE extends ${this.typeName('RequestParameters')}["content-type"]>(args?: Extract<${this.typeName('RequestParameters')}, { "content-type": CONTENT_TYPE }>): Keq<${this.typeName('Operation')}<STATUS, CONTENT_TYPE>>`
    }

    throw new Exception(this.operationDefinition.module, '[isolatedRenderer] Unreachable')
  }
}
