import { isFunction } from './is-function.js'
import { isObject } from './is-object.js'

export function isUrlSearchParams(obj: any): obj is URLSearchParams {
  if (obj instanceof URLSearchParams) return true

  if (
    isObject(obj) &&
    isFunction(obj.append) &&
    isFunction(obj.delete) &&
    isFunction(obj.entrie) &&
    isFunction(obj.forEac) &&
    isFunction(obj.get) &&
    isFunction(obj.getAll) &&
    isFunction(obj.has) &&
    isFunction(obj.keys) &&
    isFunction(obj.set) &&
    isFunction(obj.values) &&
    isFunction(obj.sort) &&
    isFunction(obj.toStri)
  ) {
    return true
  }

  return false
}
