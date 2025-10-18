/* eslint-disable @typescript-eslint/no-explicit-any */
import { Validator } from '~/validator/index.js'


export function cloneBody<T>(obj: T): T {
  if (Validator.isFormData(obj)) {
    const formData = new FormData()
    for (const [key, value] of obj.entries()) {
      formData.append(key, value)
    }
    return formData as unknown as T
  }

  if (Validator.isUrlSearchParams(obj)) {
    const urlSearchParams = new URLSearchParams()
    for (const [key, value] of obj.entries()) {
      urlSearchParams.append(key, value)
    }
    return urlSearchParams as unknown as T
  }

  if (Validator.isFile(obj)) {
    return obj
  }

  if (Validator.isBlob(obj)) {
    return obj
  }

  if (Validator.isBuffer(obj)) {
    return obj
  }

  if (obj === null) {
    return null as T
  }

  if (Array.isArray(obj)) {
    return obj.map(cloneBody) as unknown as T
  }

  if (Validator.isObject(obj)) {
    const cloned: any = {}

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = cloneBody(obj[key])
      }
    }
    return cloned
  }

  return obj
}
