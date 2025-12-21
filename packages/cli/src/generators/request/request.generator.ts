import { Artifact } from '~/models/index.js'
import { Generator } from '~/types/index.js'


export const BASE_GENERATOR = 'baseGenerator'

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
      id: 'request',
      filepath: './request.ts',
      content,
    })
  }


  compile(): Artifact[] {
    return [
      this.generateRequestArtifact(),
    ]
  }
}
