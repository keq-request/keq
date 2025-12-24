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
      lines.push(` * ${R.trim(operation.summary)}`)
      lines.push(' *')
    }

    if (operation.description && typeof operation.description === 'string') {
      lines.push(` * @description ${R.trim(operation.description)}`)
    }

    lines.push(' */')

    return lines.join('\n')
  }
}
