import { ApiDocumentV3_1 } from '~/models/index.js'
import { ApiDocumentNestjsClientRendererOptions, NestjsClientRenderer } from './nestjs-client.renderer.js'
import { ApiDocumentNestjsModuleRendererOptions, NestjsModuleRenderer } from './nestjs-module.renderer.js'


export class ApiDocumentTransformer {
  static toNestjsModule(document: ApiDocumentV3_1, options: ApiDocumentNestjsModuleRendererOptions): string {
    return new NestjsModuleRenderer(document, options).render()
  }

  static toNestjsClient(document: ApiDocumentV3_1, options: ApiDocumentNestjsClientRendererOptions): string {
    return new NestjsClientRenderer(document, options).render()
  }
}
