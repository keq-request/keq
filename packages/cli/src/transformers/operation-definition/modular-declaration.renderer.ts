import * as R from 'ramda'
import { OpenAPIV3_1 } from '@scalar/openapi-types'
import { OperationDefinition, ResponseDefinition, SchemaDefinition } from '~/models/index.js'
import { typeNameFactory } from './utils/index.js'
import { JsonSchemaUtils } from '~/utils/json-schema-utils/index.js'
import { JsonSchemaDeclarationRendererOptions, ReferenceTransformer } from '../json-schema/index.js'
import { Renderer } from '../types/renderer.js'
import { DeclarationRenders } from './declaration.renders.js'


export interface ModularDeclarationRendererOptions {
  esm?: boolean
  additionalPropertiesType?: 'unknown' | 'any'

  getDependentSchemaDefinitionFilepath(dependentSchemaDefinition: SchemaDefinition): string
  getDependentResponseDefinitionFilepath(dependentResponseDefinition: ResponseDefinition): string
}

const alias = (name: string): string => `${name}Schema`
const responseAlias = (name: string): string => `${name}Response`

export class ModularDeclarationRenderer implements Renderer {
  private renders: DeclarationRenders

  constructor(
    private readonly operationDefinition: OperationDefinition,
    private readonly options: ModularDeclarationRendererOptions,
  ) {
    const typeName = typeNameFactory(operationDefinition)
    const hint = `Referenced from operation "${operationDefinition.method.toUpperCase()} ${operationDefinition.pathname}".`

    const jsonSchemaOptions: JsonSchemaDeclarationRendererOptions = {
      referenceTransformer: (schema: OpenAPIV3_1.ReferenceObject) => {
        if (schema.$ref && schema.$ref.startsWith('#') && !operationDefinition.document.isRefDefined(schema.$ref)) {
          return ReferenceTransformer.toNotFoundDeclaration(schema, hint)
        }

        return ReferenceTransformer.toDeclaration(schema, alias)
      },
      additionalPropertiesType: options.additionalPropertiesType,
    }

    this.renders = new DeclarationRenders(operationDefinition, {
      typeName,
      jsonSchemaOptions,
      resolveRefResponse: responseAlias,
    })
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

    const responseDefinitions = this.operationDefinition.getResponseDependencies()
      .filter((responseDefinition) => !ResponseDefinition.isUnknown(responseDefinition))

    const $responseDefinitions = responseDefinitions
      .map((responseDefinition) => {
        const filepath = this.options.getDependentResponseDefinitionFilepath(responseDefinition)
        const responseName = responseDefinition.name

        return `import type { ${responseName} as ${responseAlias(responseName)} } from "${filepath}"`
      })
      .map((str) => (str.replace(/ from "(\.\.?\/.+?)(\.ts|\.mts|\.cts|\.js|\.cjs|\.mjs)?"/, this.options.esm ? ' from "$1.js"' : ' from "$1"')))

    return [
      'import type { KeqOperation, KeqPathParameterInit, KeqQueryInit, ServerSentEvent } from "keq"',
      ...$schemaDefinitions,
      ...$responseDefinitions,
    ].join('\n')
  }

  render(): string {
    const { operation } = this.operationDefinition

    if (!operation.responses) return ''

    const parameters = operation.parameters?.filter((p): p is OpenAPIV3_1.ParameterObject => !JsonSchemaUtils.isRef(p)) || []
    const typeName = typeNameFactory(this.operationDefinition)

    const $dependencies = this.renderDependencies()
    const $responseBodies = this.renders.renderResponseBodies()
    const $requestBodies = this.renders.renderRequestBodies()
    const $parameterBodies = this.renders.renderParameterBodies()
    const $requestParameters = this.renders.renderRequestParameters()
    const $requestQuery = this.renders.renderParameters(
      `${typeName('RequestQuery')}`,
      parameters.filter((p) => p.in === 'query'),
    )
    const $routeParameters = this.renders.renderParameters(
      `${typeName('RouteParameters')}`,
      parameters.filter((p) => p.in === 'path'),
    )
    const $requestHeaders = this.renders.renderParameters(
      `${typeName('RequestHeaders')}`,
      parameters.filter((p) => p.in === 'header'),
    )
    const $fileComment = this.renders.renderFileComment()
    const $operationInterface = this.renders.renderOperationInterface()

    return [
      $fileComment,
      '',
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
      $operationInterface,
      '',
      '/* @anchor:file:end */',
    ].filter(R.isNotNil).join('\n')
  }
}
