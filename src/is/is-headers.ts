import { isFunction } from './is-function.js'
import { isObject } from './is-object.js'

export function isHeaders(obj: any): obj is Headers {
  if (obj instanceof Headers) return true

  if (
    isObject(obj) &&
    isFunction(obj.forEach) &&
    isFunction(obj.get) &&
    isFunction(obj.has) &&
    isFunction(obj.set) &&
    isFunction(obj.append) &&
    isFunction(obj.delete) &&
    isFunction(obj.entries) &&
    isFunction(obj.keys) &&
    isFunction(obj.values)
  ) {
    return true
  }

  return false
}
