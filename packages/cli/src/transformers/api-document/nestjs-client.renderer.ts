import * as R from 'ramda'
import * as changeCase from 'change-case'
import { ApiDocumentV3_1, OperationDefinition } from '~/models/index.js'
import { Renderer } from '../types/renderer.js'
import { OperationDefinitionTransformer, typeNameFactory } from '../operation-definition/index.js'
import { KeqQueryOptionsFactory } from '~/types/index.js'
import { KeqQueryOptions } from 'keq'
import { indent } from '~/utils/indent.js'


export interface ApiDocumentNestjsClientRendererOptions {
  esm?: boolean
  qs?: KeqQueryOptions | KeqQueryOptionsFactory

  getOperationDefinitionDeclarationFilepath(this: void, operationDefinition: OperationDefinition): string
}


export class NestjsClientRenderer implements Renderer {
  constructor(
    private readonly document: ApiDocumentV3_1,
    private readonly options: ApiDocumentNestjsClientRendererOptions,
  ) {

  }

  private renderDependencies(): string {
    const $operations = this.document.operations
      .map((operationDefinition) => {
        const filepath = this.options.getOperationDefinitionDeclarationFilepath(operationDefinition)
        const typeName = typeNameFactory(operationDefinition)

        return `import type { ${typeName('Operation')}, ${typeName('ResponseBodies')}, ${typeName('RequestParameters')} } from "${filepath}"`
      })
      .map((str) => (str.replace(/ from "(\.\.?\/.+?)(\.ts|\.mts|\.cts|\.js|\.cjs|\.mjs)?"/, this.options.esm ? ' from "$1.js"' : ' from "$1"')))

    return [
      'import { Injectable, Logger } from "@nestjs/common"',
      'import { Keq, KeqRequest } from "keq"',
      ...$operations,
    ]
      .join('\n')
  }

  render(): string {
    const moduleName = changeCase.pascalCase(this.document.module.name)

    const $dependencies = this.renderDependencies()
    const $operations = this.document.operations
      .map((operation) => OperationDefinitionTransformer.toNestjsMethod(operation, {
        esm: this.options.esm,
        qs: this.options.qs,
        getOperationDefinitionDeclarationFilepath: this.options.getOperationDefinitionDeclarationFilepath,
      }))
      .join('\n\n')

    return [
      '/* @anchor:file:start */',
      '',
      $dependencies,
      '',
      '@Injectable()',
      `export class ${moduleName}Client {`,
      `  private readonly logger = new Logger(${moduleName}Client.name)`,
      '',
      '  constructor(',
      '    // @anchor:client-constructor-parameters:start',
      '    private readonly request: KeqRequest,',
      '    // @anchor:client-constructor-parameters:end',
      '  ) {}',
      '',
      indent(2, $operations),
      '}',
      '',
      '/* @anchor:file:end */',
    ].filter(R.isNotNil).join('\n')
  }
}
