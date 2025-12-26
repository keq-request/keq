import { Compiler, TaskWrapper } from '~/compiler/index.js'
import { Artifact } from '~/models/index.js'
import { Generator } from '~/types/index.js'


export const MICRO_FUNCTION_REQUEST_GENERATOR = 'microFunctionRequestGenerator'

export class RequestGenerator implements Generator {
  private generateRequestArtifact(): Artifact {
    const content = [
      '/* @anchor:file:start */',
      '',
      'import { KeqRequest } from "keq"',
      '',
      '/* @anchor:request-declaration */',
      'export const request = new KeqRequest()',
      '',
      '/* @anchor:file:end */',
    ].join('\n')

    return new Artifact({
      id: RequestGenerator.getRequestArtifactId(),
      filepath: RequestGenerator.getRequestArtifactFilepath(),
      content,
    })
  }


  // eslint-disable-next-line @typescript-eslint/require-await
  async compile(compiler: Compiler, task: TaskWrapper): Promise<Artifact[]> {
    return [
      this.generateRequestArtifact(),
    ]
  }

  static getRequestArtifactFilepath(): string {
    return './request.ts'
  }

  static getRequestArtifactId(): string {
    return `request?generator=${MICRO_FUNCTION_REQUEST_GENERATOR}`
  }
}
