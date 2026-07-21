import { Compiler, TaskWrapper } from '~/compiler/index.js'
import { Artifact } from '~/models/index.js'
import { Generator } from '~/types/index.js'
import { FileNamingStyle } from '~/constants/index.js'
import { convertFilename } from '~/utils/convert-filename.js'


export const MICRO_FUNCTION_REQUEST_GENERATOR = 'microFunctionRequestGenerator'

export class RequestGenerator implements Generator {
  private generateRequestArtifact(moduleName: string, fileNamingStyle: FileNamingStyle, options?: { v2Compat?: boolean }): Artifact {
    const v2Compat = options?.v2Compat ?? false

    const content = v2Compat
      ? [
        '',
        '/* @anchor:file:start */',
        '',
        'import { KeqRequest, request as globalRequest } from "keq"',
        '',
        '/* @anchor:request-declaration */',
        'export const request = new KeqRequest()',
        'request.inherit(globalRequest)',
        '',
        '/* @anchor:file:end */',
      ].join('\n')
      : [
        '',
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
      id: RequestGenerator.getRequestArtifactId(moduleName),
      filepath: RequestGenerator.getRequestArtifactFilepath(moduleName, fileNamingStyle),
      content,
    })
  }


  // eslint-disable-next-line @typescript-eslint/require-await
  async compile(compiler: Compiler, task: TaskWrapper): Promise<Artifact[]> {
    const context = compiler.context
    const rc = context.rc!
    const documents = context.documents!

    const moduleNames = [...new Set(
      documents.flatMap((doc) => doc.operations.map((op) => op.module.name)),
    )]

    return moduleNames.map((moduleName) =>
      this.generateRequestArtifact(moduleName, rc.rendering.fileNamingStyle, {
        v2Compat: rc.rendering.v2Compat,
      }),
    )
  }

  static getRequestArtifactFilepath(moduleName: string, fileNamingStyle: FileNamingStyle): string {
    return `./${convertFilename(moduleName, fileNamingStyle)}/request.ts`
  }

  static getRequestArtifactId(moduleName: string): string {
    return `request?module=${moduleName}&generator=${MICRO_FUNCTION_REQUEST_GENERATOR}`
  }
}
