import { OpenAPIV3_1 } from '@scalar/openapi-types'
import { CommentRenderer } from './comment.renderer.js'
import { DeclarationRenderer, JsonSchemaDeclarationRendererOptions } from './declaration.renderer.js'
import { ZodRenderer, JsonSchemaZodRendererOptions } from './zod.renderer.js'


export class JsonSchemaTransformer {
  static toComment(schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject): string {
    return new CommentRenderer(schema).render()
  }

  static toDeclaration(schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject, options?: JsonSchemaDeclarationRendererOptions): string {
    return new DeclarationRenderer(schema, options).render()
  }

  static toZod(schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject, options?: JsonSchemaZodRendererOptions): string {
    return new ZodRenderer(schema, options).render()
  }
}
