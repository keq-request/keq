import * as R from 'ramda'
import { OperationDefinition } from '~/models/index.js'
import { Renderer } from '../types/renderer.js'
import { typeNameFactory, TypeNameFn } from './utils/index.js'
import { indent } from '~/utils/indent.js'
import { Exception } from '~/exception.js'
import { CommentRenderer } from './comment.renderer.js'
import { OperationDefinitionSnippet, OperationDefinitionSnippetOptions } from './typescript-helper.js'


export interface OperationDefinitionMicroFunctionRendererOptions extends OperationDefinitionSnippetOptions {
  getOperationDefinitionDeclarationFilepath(operationDefinition: OperationDefinition): string
}

export class OperationDefinitionMicroFunctionRenderer implements Renderer {
  helper: OperationDefinitionSnippet
  typeName: TypeNameFn

  constructor(
    private readonly operationDefinition: OperationDefinition,
    private readonly options: OperationDefinitionMicroFunctionRendererOptions,
  ) {
    this.typeName = typeNameFactory(operationDefinition)
    this.helper = new OperationDefinitionSnippet(operationDefinition, options)
  }

  render(): string {
    const { operation, operationId, method, pathname } = this.operationDefinition
    if (!operation.responses) return ''

    const $dependencies = this.renderDependencies()
    const $comment = new CommentRenderer(this.operationDefinition).render()

    const moduleName = this.operationDefinition.module.name

    const $method = method.toLowerCase()
    const $queryParameters = this.helper.renderRequestQuery()
    const $headerParameters = this.helper.renderRequestHeaders()
    const $pathParameters = this.helper.renderRequestPathParameters()

    const $mediaType = this.helper.renderMediaType()

    const $requestBody = this.helper.renderRequestBody()

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
      $comment || undefined,
      `export ${$operationDeclaration} {`,
      `  const req = request.${$method}<${this.typeName('ResponseBodies')}[STATUS]>("${pathname}")`,
      '    .option(\'module\', { name: moduleName, pathname, method })',
      '',
      $mediaType || undefined,
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

  private renderOperationDeclaration(): string {
    const { operationId } = this.operationDefinition

    const mediaTypes = this.helper.getRequestMediaTypes()

    if (mediaTypes.length === 0) {
      return `function ${operationId}<STATUS extends keyof ${this.typeName('ResponseBodies')}, CONTENT_TYPE extends never = never>(args?: ${this.typeName('RequestParameters')}): Keq<${this.typeName('Operation')}<STATUS, CONTENT_TYPE>>`
    } else if (mediaTypes.length === 1) {
      return `function ${operationId}<STATUS extends keyof ${this.typeName('ResponseBodies')}, CONTENT_TYPE extends ${JSON.stringify(mediaTypes[0])} = ${JSON.stringify(mediaTypes[0])}>(args?: ${this.typeName('RequestParameters')}): Keq<${this.typeName('Operation')}<STATUS, CONTENT_TYPE>>`
    } else if (mediaTypes.length > 1) {
      return `function ${operationId}<STATUS extends keyof ${this.typeName('ResponseBodies')}, CONTENT_TYPE extends ${this.typeName('RequestParameters')}["content-type"]>(args?: Extract<${this.typeName('RequestParameters')}, { "content-type": CONTENT_TYPE }>): Keq<${this.typeName('Operation')}<STATUS, CONTENT_TYPE>>`
    }

    throw new Exception(this.operationDefinition.module, '[operationDeclarationRenderer] Unreachable')
  }
}
