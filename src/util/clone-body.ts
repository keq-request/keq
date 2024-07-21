import { isBuffer } from '../is/is-buffer.js'
import { isBlob } from '../is/is-blob.js'
import { isFile } from '../is/is-file.js'
import { isFormData } from '../is/is-form-data.js'
import { isObject } from '../is/is-object.js'
import { isUrlSearchParams } from '../is/is-url-search-params.js'


export function cloneBody<T>(obj: T): T {
  if (isFormData(obj)) {
    const formData = new FormData()
    for (const [key, value] of obj.entries()) {
      formData.append(key, value)
    }
    return formData as unknown as T
  }

  if (isUrlSearchParams(obj)) {
    const urlSearchParams = new URLSearchParams()
    for (const [key, value] of obj.entries()) {
      urlSearchParams.append(key, value)
    }
    return urlSearchParams as unknown as T
  }

  if (isFile(obj)) {
    return obj
  }

  if (isBlob(obj)) {
    return obj
  }

  if (isBuffer(obj)) {
    return obj
  }

  if (obj === null) {
    return null as T
  }

  if (Array.isArray(obj)) {
    return obj.map(cloneBody) as unknown as T
  }

  if (isObject(obj)) {
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
