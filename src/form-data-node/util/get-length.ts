// import { promises as fs } from 'fs'

import isReadStream from './is-read-stream'
import isStream from './is-stream'
import isBlob from './is-blob'

const { isBuffer } = Buffer

/**
 * Get lenght of given value (in bytes)
 *
 * @param {any} value
 *
 * @return {number | undefined}
 *
 * @api private
 */
async function getLength(value): Promise<any> {
  if (isStream(value)) {
    if (!isReadStream(value)) {
      return undefined
    }

    /**
     * In order to compatible browser
     */
    throw new Error('Read Stream is not supported by Keq FormData')
  }

  if (isBuffer(value)) {
    return value.length
  }

  if (isBlob(value)) {
    return value.size
  }

  return Buffer.from(String(value)).length
}

export default getLength
