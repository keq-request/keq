
import { isBuffer } from '~/is/is-buffer.js'
import { Exception } from '../exception/exception.js'
import { isFormData } from '../is/is-form-data.js'
import { isUrlSearchParams } from '../is/is-url-search-params.js'

import type { KeqContextRequestBody } from '../types/keq-context-request.js'
import { isArrayBuffer } from '~/is/is-array-buffer.js'
import { isBlob } from '~/is/is-blob.js'
import { isReadableStream } from '~/is/is-readable-stream.js'


export function mergeKeqRequestBody(left: KeqContextRequestBody, right: KeqContextRequestBody): KeqContextRequestBody {
  if (right === undefined) return left

  if (typeof right === 'number') {
    throw new TypeError('Not support number type')
  }

  if (
    left === null ||
    right === null ||
    isBuffer(right) ||
    isArrayBuffer(right) ||
    isBlob(right) ||
    isReadableStream(right) ||
    isBuffer(left) ||
    isArrayBuffer(left) ||
    isBlob(left) ||
    isReadableStream(left) ||
    Array.isArray(left) ||
    Array.isArray(right) ||
    (typeof left !== 'object' && left !== undefined) ||
    typeof right !== 'object'
  ) {
    return Array.isArray(right) ? [...right] : right
  }

  const result = left || {}

  if (isUrlSearchParams(right)) {
    const keys = right.keys()
    for (const key of keys) {
      const values = right.getAll(key)
      if (values.length === 1) {
        result[key] = values[0]
      } else if (values.length > 1) {
        result[key] = values
      }
    }
  } else if (isFormData(right)) {
    const keys = right.keys()
    for (const key of keys) {
      const values = right.getAll(key)
      if (values.length === 1) {
        result[key] = values[0]
      } else if (values.length > 1) {
        result[key] = values
      }
    }
  } else if (typeof right === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const key in (right as any)) {
      result[key] = right[key]
    }
  } else {
    throw new Exception(`Not support request body type: ${typeof right}`)
  }

  return result
}
