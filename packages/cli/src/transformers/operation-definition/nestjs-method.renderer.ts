import * as R from 'ramda'
import { TypeNameFn, typeNameFactory } from './utils/index.js'
import { OperationDefinition } from '~/models/index.js'
import { OperationDefinitionSnippet, OperationDefinitionSnippetOptions } from './typescript-helper.js'
import { CommentRenderer } from './comment.renderer.js'
import { indent } from '~/utils/indent.js'
import { Renderer } from '../types/renderer.js'
import { Exception } from '~/exception.js'


export type OperationDefinitionNestjsMethodRendererOptions = OperationDefinitionSnippetOptions

export class OperationDefinitionNestjsMethodRenderer implements Renderer {
  helper: OperationDefinitionSnippet
  typeName: TypeNameFn

  constructor(
    private readonly operationDefinition: OperationDefinition,
    private readonly options: OperationDefinitionNestjsMethodRendererOptions,
  ) {
    this.typeName = typeNameFactory(operationDefinition)
    this.helper = new OperationDefinitionSnippet(operationDefinition, options)
  }


  render(): string {
    // const operationId = changeCase.camelCase(this.operationDefinition.operationId)
    const pathname = this.operationDefinition.pathname

    const $comment = new CommentRenderer(this.operationDefinition).render()
    const $method = this.operationDefinition.method.toLowerCase()
    const $mediaType = this.helper.renderMediaType()
    const $operationDeclaration = this.renderOperationDeclaration(this.operationDefinition)
    const $queryParameters = this.helper.renderRequestQuery()
    const $headerParameters = this.helper.renderRequestHeaders()
    const $pathParameters = this.helper.renderRequestPathParameters()
    const $requestBody = this.helper.renderRequestBody()

    return [
      $comment,
      `${$operationDeclaration} {`,
      `  const req = this.request.${$method}<${this.typeName('ResponseBodies')}[STATUS]>(${JSON.stringify(pathname)})`,
      '    .option(',
      '      "module",',
      '      {',
      `        name: ${JSON.stringify(this.operationDefinition.module.name)},`,
      `        pathname: ${JSON.stringify(pathname)},`,
      `        method: ${JSON.stringify($method)},`,
      '      },',
      '    )',
      '',
      $mediaType ? indent(2, $mediaType) : undefined,
      '',
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
      '  return req',
      '}',
    ].filter(R.isNotNil).join('\n')
  }

  private renderOperationDeclaration(operationDefinition: OperationDefinition): string {
    const { operationId } = operationDefinition
    const typeName = typeNameFactory(operationDefinition)

    const mediaTypes = this.helper.getRequestMediaTypes()

    if (mediaTypes.length === 0) {
      return `${operationId}<STATUS extends keyof ${typeName('ResponseBodies')}, CONTENT_TYPE extends never = never>(args?: ${typeName('RequestParameters')}): Keq<${typeName('Operation')}<STATUS, CONTENT_TYPE>>`
    } else if (mediaTypes.length === 1) {
      return `${operationId}<STATUS extends keyof ${typeName('ResponseBodies')}, CONTENT_TYPE extends ${JSON.stringify(mediaTypes[0])} = ${JSON.stringify(mediaTypes[0])}>(args?: ${typeName('RequestParameters')}): Keq<${typeName('Operation')}<STATUS, CONTENT_TYPE>>`
    } else if (mediaTypes.length > 1) {
      return `${operationId}<STATUS extends keyof ${typeName('ResponseBodies')}, CONTENT_TYPE extends ${typeName('RequestParameters')}["content-type"]>(args?: Extract<${typeName('RequestParameters')}, { "content-type": CONTENT_TYPE }>): Keq<${typeName('Operation')}<STATUS, CONTENT_TYPE>>`
    }

    throw new Exception(operationDefinition.module, '[operationDeclarationRenderer] Unreachable')
  }
}
