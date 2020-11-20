import { Readable } from 'stream'

import * as mime from 'mime-types'

import getStreamIterator from './get-stream-iterator'
import isBlob from './is-blob'

const { isBuffer } = Buffer

/**
 * @api private
 */
class File {
  name: any
  type: any
  size: any
  lastModified: any
  __content: any

  constructor(content, name, options: any = {}) {
    this.name = name
    this.type = options.type || mime.lookup(name) || ''
    this.size = options.size || 0
    this.lastModified = options.lastModified || Date.now()

    this.__content = content
  }

  public stream(): any {
    const content = this.__content

    if (isBlob(content)) {
      return content.stream()
    }

    if (isBuffer(content)) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const readable = new Readable({ read() {} })

      readable.push(content)
      readable.push(null)

      return readable
    }

    return content
  }

  public async arrayBuffer(): Promise<ArrayBuffer | SharedArrayBuffer> {
    const iterable = getStreamIterator(this.stream())

    const chunks: any[] = []
    for await (const chunk of iterable) {
      chunks.push(chunk)
    }

    return Buffer.concat(chunks).buffer
  }

  public toString(): string {
    return '[object File]'
  }

  public get [Symbol.toStringTag](): string {
    return 'File'
  }
}

export default File
