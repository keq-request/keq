
import { Validator } from '~/validator/index.js'
import { Exception } from '~/exception/index.js'
import { KeqRequestBody } from '~/request-init/index.js'


export function mergeKeqRequestBody(left: KeqRequestBody, right: KeqRequestBody): KeqRequestBody {
  if (right === undefined) return left

  if (typeof right === 'number') {
    throw new TypeError('Cannot set request body to a number.')
  }

  if (
    left === null
    || right === null
    || Validator.isBuffer(right)
    || Validator.isArrayBuffer(right)
    || Validator.isBlob(right)
    || Validator.isReadableStream(right)
    || Validator.isBuffer(left)
    || Validator.isArrayBuffer(left)
    || Validator.isBlob(left)
    || Validator.isReadableStream(left)
    || Array.isArray(left)
    || Array.isArray(right)
    || (typeof left !== 'object' && left !== undefined)
    || typeof right !== 'object'
  ) {
    return Array.isArray(right) ? [...right] : right
  }

  const result = left || {}

  if (Validator.isUrlSearchParams(right)) {
    const keys = right.keys()
    for (const key of keys) {
      const values = right.getAll(key)
      if (values.length === 1) {
        result[key] = values[0]
      } else if (values.length > 1) {
        result[key] = values
      }
    }
  } else if (Validator.isFormData(right)) {
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
