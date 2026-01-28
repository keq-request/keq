import { OpenAPIV3_1 } from '@scalar/openapi-types'
import { CommentRenderer } from './comment.renderer.js'
import { DeclarationRenderer, JsonSchemaDeclarationRendererOptions } from './declaration.renderer.js'
import { ValibotRenderer, JsonSchemaValibotRendererOptions } from './valibot.renderer.js'


export class JsonSchemaTransformer {
  static toComment(schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject): string {
    return new CommentRenderer(schema).render()
  }

  static toDeclaration(schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject, options?: JsonSchemaDeclarationRendererOptions): string {
    return new DeclarationRenderer(schema, options).render()
  }

  static toValibot(schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject, options?: JsonSchemaValibotRendererOptions): string {
    return new ValibotRenderer(schema, options).render()
  }
}
