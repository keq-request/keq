/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Exception } from '~/exception/exception.js'
import { OverwriteArrayBodyException } from '~/exception/overwrite-array-body.exception.js'
import { isFormData } from '~/is/is-form-data.js'
import { isUrlSearchParams } from '~/is/is-url-search-params.js'
import { KeqContextRequestBody } from '~/types/keq-context-request.js'


export function assignKeqRequestBody(left: KeqContextRequestBody, right: object | Array<any> | FormData | URLSearchParams | string): KeqContextRequestBody {
  if (Array.isArray(left)) {
    throw new OverwriteArrayBodyException()
  }
  if (Array.isArray(right) && left) {
    throw new Exception(`Cannot overwrite body(${typeof right}) with array`)
  }
  if (typeof right === 'string' && left) {
    throw new Exception(`Cannot overwrite body(${typeof left}) with string`)
  }

  if (Array.isArray(right)) {
    return [...right]
  }

  if (typeof right === 'string') {
    return right
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
    for (const key in right) {
      result[key] = right[key]
    }
  } else {
    throw new Exception(`Not support request body type: ${typeof right}`)
  }

  return result
}
