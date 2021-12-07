// import { promises as fs } from 'fs'

import { isReadStream, isStream, isBlob } from '@/util'
import { Exception } from '@/exception'


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
    throw new Exception('Read Stream is not supported by Keq FormData')
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
