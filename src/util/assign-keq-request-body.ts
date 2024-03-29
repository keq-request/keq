/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Exception } from '~/exception/exception'
import { OverwriteArrayBodyException } from '~/exception/overwrite-array-body.exception'
import { isFormData } from '~/is/is-form-data'
import { isUrlSearchParams } from '~/is/is-url-search-params'
import { KeqRequestBody } from '~/types/keq-request-body'

export function assignKeqRequestBody(left: KeqRequestBody, right: object | Array<any> | FormData | URLSearchParams | string): KeqRequestBody {
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
