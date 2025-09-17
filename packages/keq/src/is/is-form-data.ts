/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction } from './is-function.js'
import { isObject } from './is-object.js'

export function isFormData(object: any): object is FormData {
  if (object instanceof FormData) return true

  return (
    isObject(object) &&
    isFunction(object.append) &&
    isFunction(object.delete) &&
    isFunction(object.get) &&
    isFunction(object.getAll) &&
    isFunction(object.has) &&
    isFunction(object.set) &&
    isFunction(object.entries) &&
    isFunction(object.keys) &&
    isFunction(object.values)
  )
}
