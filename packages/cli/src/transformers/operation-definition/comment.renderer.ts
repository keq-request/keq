import * as R from 'ramda'
import { OperationDefinition } from '~/models/index.js'
import { Renderer } from '../types/renderer.js'


export class CommentRenderer implements Renderer {
  constructor(
    private readonly operationDefinition: OperationDefinition,
  ) {}

  render(): string {
    const operation = this.operationDefinition.operation
    if (!operation.summary && !operation.description) return ''

    const lines = ['/**']

    if (operation.summary && typeof operation.summary === 'string') {
      const summary = R.trim(operation.summary)
        .replace(/\t/g, '  ')
        .replace(/\r\n?/g, '\n')

      lines.push(...summary.split('\n').map((line) => ` * ${line.trimEnd()}`))
      lines.push(' *')
    }

    if (operation.description && typeof operation.description === 'string') {
      const description = R.trim(operation.description)
        .replace(/\t/g, '  ')
        .replace(/\r\n?/g, '\n')

      const descriptionLines = description.split('\n').map((line) => line.trimEnd())
      lines.push(` * @description ${descriptionLines[0]}`)
      lines.push(...descriptionLines.slice(1).map((line) => ` * ${line}`))
    }

    lines.push(' */')

    return lines.join('\n')
  }
}
