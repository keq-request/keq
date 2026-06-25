/* eslint-disable @typescript-eslint/no-explicit-any */
import { isObject } from '../is/is-object.js'


/**
 * @description 浅拷贝
 */
export function shallowClone<T = any>(obj: T): T {
  if (Array.isArray(obj)) {
    return [...obj] as T
  }

  if (isObject(obj)) {
    return { ...obj }
  }

  return obj
}
