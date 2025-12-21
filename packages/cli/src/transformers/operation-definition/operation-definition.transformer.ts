import { OperationDefinition } from '~/models/index.js'
import { DeclarationRenderer, OperationDefinitionDeclarationRendererOptions } from './declaration.renderer.js'
import { OperationDefinitionTypescriptRendererOptions, TypescriptRenderer } from './typescript.renderer.js'


export class OperationDefinitionTransformer {
  static toDeclaration(operationDefinition: OperationDefinition, options: OperationDefinitionDeclarationRendererOptions): string {
    return new DeclarationRenderer(operationDefinition, options).render()
  }

  static toTypescript(operationDefinition: OperationDefinition, options: OperationDefinitionTypescriptRendererOptions): string {
    return new TypescriptRenderer(operationDefinition, options).render()
  }
}
