import { OpenAPIV3_1 } from '@scalar/openapi-types'
import { Renderer } from '../types/renderer.js'


export class CommentRenderer implements Renderer {
  constructor(
    private readonly schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
  ) {}

  render(): string {
    const schema = this.schema

    const lines = ['/**']

    if (schema.description) {
      const description = schema.description
        .replace('*/', '*\\/')
        .replace(/\t/g, '  ')
        .replace(/\r\n?/g, '\n')

      lines.push(...description.split('\n').map((line) => ` * ${line.trimEnd()}`))
    }

    if (schema.deprecated) {
      lines.push(' * @deprecated')
    }

    if (schema.readOnly) {
      lines.push(' * @readonly')
    }

    if (schema.format) {
      lines.push(` * @format ${schema.format}`)
    }

    lines.push(' */')

    if (lines.length === 2) return ''
    return lines.join('\n')
  }
}
