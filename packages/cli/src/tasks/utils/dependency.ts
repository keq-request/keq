import * as path from 'path'
import { Artifact } from './artifact.js'
import { toComment } from './to-comment.js'

export type DependencySource = string | Artifact

export interface DependencyOptions {
  export?: boolean
}

export class DependencyIdentifier {
  constructor(
    public name: string,
    public alias?: string,
  ) {}

  toCode(): string {
    if (this.alias) {
      return `${this.name} as ${this.alias}`
    }
    return this.name
  }
}

export class Dependency {
  readonly source: DependencySource
  readonly identifiers: DependencyIdentifier[]
  readonly export: boolean
  readonly belongTo: Artifact


  constructor(source: DependencySource, identifiers: (string | DependencyIdentifier)[], belongTo: Artifact, options?: DependencyOptions) {
    this.source = source
    this.identifiers = identifiers.map((i) => (typeof i === 'string' ? new DependencyIdentifier(i) : i))
    this.export = !!options?.export
    this.belongTo = belongTo
  }

  private get realSource(): string {
    if (typeof this.source === 'string') {
      if (this.source.startsWith('.')) return path.relative(this.belongTo.filepath, this.source)
      return this.source
    }
    return this.source.relativeTo(this.belongTo.dirname)
  }

  toCode(): string {
    try {
      const fullpath = this.realSource

      if (this.identifiers.length > 0) {
        const $identifiers = this.identifiers.map((i) => i.toCode()).join(', ')
        return `${this.export ? 'export' : 'import'} { ${$identifiers} } from '${fullpath}'`
      }

      if (this.export) {
        return `export * from '${fullpath}'`
      }

      return `import '${fullpath}'`
    } catch (err) {
      return toComment(String(err))
    }
  }
}
