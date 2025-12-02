import * as R from 'ramda'
import { OperationDefinition } from '~/tasks/utils/operation-definition.js'
import { typeNameFactory, TypeNameFn } from '../operation-type/index.js'
import { OpenAPIV3_1 } from '@scalar/openapi-types'
import { JsonSchemaUtils } from '~/utils/json-schema-utils/index.js'
import { KeqQueryOptionsFactory } from '~/types/runtime-config.js'
import { requestBodyRenderer } from './request-body.js'


interface OperationRequestRendererOptions {
  qs: KeqQueryOptionsFactory
}


function requestHeadersRenderer(operationDefinition: OperationDefinition, typeName: TypeNameFn): string {
  const { operation } = operationDefinition

  const $headers = (operation.parameters || [])
    .filter((p): p is OpenAPIV3_1.ParameterObject => !JsonSchemaUtils.isRef(p))
    .filter((p) => p.in === 'header')
    .map((p) => `  if (args && ${JSON.stringify(p.name)} in args) req.header(${JSON.stringify(p.name)}, args[${JSON.stringify(p.name)}])`)
    .concat('')
    .join('\n')

  return $headers
}

function requestQueryRenderer(operationDefinition: OperationDefinition, qs: KeqQueryOptionsFactory, typeName: TypeNameFn): string {
  const { operation } = operationDefinition

  const $query = (operation.parameters || [])
    .filter((p): p is OpenAPIV3_1.ParameterObject => !JsonSchemaUtils.isRef(p))
    .filter((p) => p.in === 'query')
    .map((p) => {
      const option = qs(p)
      const $option = (!option || R.isEmpty(option)) ? '' : `, ${JSON.stringify(option)}`

      return `  if (args && ${JSON.stringify(p.name)} in args) req.query(${JSON.stringify(p.name)}, args[${JSON.stringify(p.name)}]${$option})`
    })
    .concat('')
    .join('\n')

  return $query
}

function requestPathParametersRenderer(operationDefinition: OperationDefinition, typeName: TypeNameFn): string {
  const { operation } = operationDefinition

  const $pathParameters = (operation.parameters || [])
    .filter((p): p is OpenAPIV3_1.ParameterObject => !JsonSchemaUtils.isRef(p))
    .filter((p) => p.in === 'path')
    .map((p) => `  if (args && ${JSON.stringify(p.name)} in args) req.params(${JSON.stringify(p.name)}, args[${JSON.stringify(p.name)}])`)
    .concat('')
    .join('\n')

  return $pathParameters
}

function getRequestMediaTypes(operationDefinition: OperationDefinition): string[] {
  const { operation } = operationDefinition
  const requestBodyContent = (operation.requestBody?.content || {}) as Record<string, OpenAPIV3_1.MediaTypeObject>
  return Object.keys(requestBodyContent)
}

function mediaTypeRenderer(operationDefinition: OperationDefinition): string {
  const mediaTypes = getRequestMediaTypes(operationDefinition)

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

function operationDeclarationRenderer(operationDefinition: OperationDefinition, typeName: TypeNameFn): string {
  const { operationId } = operationDefinition

  const mediaTypes = getRequestMediaTypes(operationDefinition)

  if (mediaTypes.length === 0) {
    return `function ${operationId}<STATUS extends keyof ${typeName('ResponseBodies')}, CONTENT_TYPE extends never = never>(args?: ${typeName('RequestParameters')}): Keq<Operation<STATUS, CONTENT_TYPE>>`
  } else if (mediaTypes.length === 1) {
    return `function ${operationId}<STATUS extends keyof ${typeName('ResponseBodies')}, CONTENT_TYPE extends ${JSON.stringify(mediaTypes[0])} = ${JSON.stringify(mediaTypes[0])}>(args?: ${typeName('RequestParameters')}): Keq<Operation<STATUS, CONTENT_TYPE>>`
  } else if (mediaTypes.length > 1) {
    return `function ${operationId}<STATUS extends keyof ${typeName('ResponseBodies')}, CONTENT_TYPE extends ${typeName('RequestParameters')}["content-type"]>(args?: Extract<${typeName('RequestParameters')}, { "content-type": CONTENT_TYPE }>): Keq<Operation<STATUS, CONTENT_TYPE>>`
  }

  throw new Error('[operationDeclarationRenderer] Unreachable')
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function operationRequestRenderer(operationDefinition: OperationDefinition, options: OperationRequestRendererOptions): Promise<string> {
  const { operation, operationId, method, pathname } = operationDefinition
  const { qs } = options

  if (!operation.responses) return ''

  const typeName = typeNameFactory(operationDefinition)
  const moduleName = operationDefinition.module.name

  const $method = method.toLowerCase()
  const $queryParameters = requestQueryRenderer(operationDefinition, qs, typeName)
  const $headerParameters = requestHeadersRenderer(operationDefinition, typeName)
  const $pathParameters = requestPathParametersRenderer(operationDefinition, typeName)

  const $mediaType = mediaTypeRenderer(operationDefinition)

  const $requestBody = requestBodyRenderer(operationDefinition, typeName)

  const $operationDeclaration = operationDeclarationRenderer(operationDefinition, typeName)

  return [
    '/* @anchor:file:start */',
    '',
    `const moduleName = "${moduleName}"`,
    `const method = "${method}"`,
    `const pathname = "${pathname}"`,
    '',
    '/* @anchor:operation-declaration */',
    `export ${$operationDeclaration} {`,
    `  const req = request.${$method}<${typeName('ResponseBodies')}[STATUS]>("${pathname}")`,
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
