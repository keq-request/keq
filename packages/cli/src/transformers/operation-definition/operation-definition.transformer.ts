import * as R from 'ramda'
import { OperationDefinition } from '~/models/index.js'
import { CommentRenderer } from './comment.renderer.js'
import { DeclarationRenderer, OperationDefinitionDeclarationRendererOptions } from './declaration.renderer.js'
import { OperationDefinitionMicroFunctionRendererOptions, OperationDefinitionMicroFunctionRenderer } from './micro-function.renderer.js'
import { OperationDefinitionNestjsMethodRenderer, OperationDefinitionNestjsMethodRendererOptions } from './nestjs-method.renderer.js'


export class OperationDefinitionTransformer {
  static toDeclaration(operationDefinition: OperationDefinition, options: OperationDefinitionDeclarationRendererOptions): string {
    return new DeclarationRenderer(operationDefinition, options).render()
  }

  static toMicroFunction(operationDefinition: OperationDefinition, options: OperationDefinitionMicroFunctionRendererOptions): string {
    return new OperationDefinitionMicroFunctionRenderer(operationDefinition, options).render()
  }

  static toNestjsMethod(operationDefinition: OperationDefinition, options: OperationDefinitionNestjsMethodRendererOptions): string {
    return new OperationDefinitionNestjsMethodRenderer(operationDefinition, options).render()
  }

  static toComment(operationDefinition: OperationDefinition): string {
    return new CommentRenderer(operationDefinition).render()
  }
}
