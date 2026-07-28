import * as R from 'ramda'
import { OperationDefinition } from '~/models/index.js'
import { CommentRenderer } from './comment.renderer.js'
import { ModularDeclarationRenderer, ModularDeclarationRendererOptions } from './modular-declaration.renderer.js'
import { OperationDefinitionMicroFunctionRendererOptions, OperationDefinitionMicroFunctionRenderer } from './micro-function.renderer.js'
import { OperationDefinitionNestjsMethodRenderer, OperationDefinitionNestjsMethodRendererOptions } from './nestjs-method.renderer.js'
import { IsolatedRenderer, OperationDefinitionIsolatedRendererOptions } from './isolated.renderer.js'


export class OperationDefinitionTransformer {
  static toDeclaration(operationDefinition: OperationDefinition, options: ModularDeclarationRendererOptions): string {
    return new ModularDeclarationRenderer(operationDefinition, options).render()
  }

  static toMicroFunction(operationDefinition: OperationDefinition, options: OperationDefinitionMicroFunctionRendererOptions): string {
    return new OperationDefinitionMicroFunctionRenderer(operationDefinition, options).render()
  }

  static toNestjsMethod(operationDefinition: OperationDefinition, options: OperationDefinitionNestjsMethodRendererOptions): string {
    return new OperationDefinitionNestjsMethodRenderer(operationDefinition, options).render()
  }

  static toIsolated(operationDefinition: OperationDefinition, options: OperationDefinitionIsolatedRendererOptions): string {
    return new IsolatedRenderer(operationDefinition, options).render()
  }

  static toComment(operationDefinition: OperationDefinition): string {
    return new CommentRenderer(operationDefinition).render()
  }
}
