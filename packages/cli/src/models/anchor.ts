import type { Artifact } from './artifact.js'

class AnchorBlock {
  constructor(
    private artifact: Artifact,
  ) {}

  /**
   * Append content to the end of the anchor block.
   */
  append(anchorName: string, content: string): void {
    const lines = this.artifact.content.split('\n')

    const anchor = `@anchor:${anchorName}:end`
    const anchorIndex = lines.findIndex((line) => line.includes(`/* ${anchor} */`))

    if (anchorIndex === -1) {
      throw new Error(`"${anchor}" not found in artifact "${this.artifact.filepath}".`)
    }

    lines.splice(anchorIndex, 0, content)
    this.artifact.content = lines.join('\n')
  }

  prepend(anchorName: string, content: string): void {
    const lines = this.artifact.content.split('\n')

    const anchor = `@anchor:${anchorName}:start`
    const anchorIndex = lines.findIndex((line) => line.includes(`/* ${anchor} */`))

    if (anchorIndex === -1) {
      throw new Error(`"${anchor}" not found in artifact "${this.artifact.filepath}".`)
    }

    lines.splice(anchorIndex + 1, 0, content)
    this.artifact.content = lines.join('\n')
  }

  replace(anchorName: string, content: string): void {
    const lines = this.artifact.content.split('\n')
    const startIndex = lines.findIndex((line) => line.includes(`/* @anchor:${anchorName}:start */`))
    const endIndex = lines.findIndex((line) => line.includes(`/* @anchor:${anchorName}:end */`))

    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
      throw new Error(`"@anchor:${anchorName}:start" or "@anchor:${anchorName}:end" not found in artifact "${this.artifact.filepath}".`)
    }

    lines.splice(startIndex + 1, endIndex - startIndex - 1, content)
    this.artifact.content = lines.join('\n')
  }
}


export class Anchor {
  block: AnchorBlock

  constructor(
    private artifact: Artifact,
  ) {
    this.block = new AnchorBlock(artifact)
  }

  append(anchorName: string, content: string): void {
    const lines = this.artifact.content.split('\n')

    const anchor = `@anchor:${anchorName}`
    const anchorIndex = lines.findIndex((line) => line.includes(`/* ${anchor} */`))

    if (anchorIndex === -1) {
      throw new Error(`"${anchor}" not found in artifact "${this.artifact.filepath}".`)
    }

    lines.splice(anchorIndex + 1, 0, content)
    this.artifact.content = lines.join('\n')
  }

  prepend(anchorName: string, content: string): void {
    const lines = this.artifact.content.split('\n')

    const anchor = `@anchor:${anchorName}`
    const anchorIndex = lines.findIndex((line) => line.includes(`/* ${anchor} */`))

    if (anchorIndex === -1) {
      throw new Error(`"${anchor}" not found in artifact "${this.artifact.filepath}".`)
    }

    lines.splice(anchorIndex, 0, content)
    this.artifact.content = lines.join('\n')
  }
}
