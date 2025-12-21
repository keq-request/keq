import * as path from 'path'
import { Artifact } from '~/models/index.js'


interface EntrypointTypescriptRendererOptions {
  esm?: boolean

  // The directory path of the entrypoint file being generated
  dirpath: string
}

export class EntrypointTransformer {
  static toTypescript(exports: Artifact[], options: EntrypointTypescriptRendererOptions): string {
    const $exports = exports.map((exportArtifact) => {
      const relativePath = path.relative(
        options.dirpath,
        exportArtifact.filepath,
      )
        .replace(/(\.ts|\.mts|\.cts|\.js|\.cjs|\.mjs)?$/, options.esm ? '.js' : '')

      return relativePath.startsWith('.')
        ? `export * from '${relativePath}'`
        : `export * from './${relativePath}'`
    })

    return [
      '/* @anchor:file:start */',
      '',
      ...$exports,
      '',
      '/* @anchor:file:end */',
    ].join('\n')
  }
}
