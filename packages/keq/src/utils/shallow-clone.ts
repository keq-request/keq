/* eslint-disable @typescript-eslint/no-explicit-any */
import { Validator } from '~/validator/index.js'


/**
 * @description 浅拷贝
 */
export function shallowClone<T = any>(obj: T): T {
  if (Array.isArray(obj)) {
    return [...obj] as T
  }

  if (Validator.isObject(obj)) {
    return { ...obj }
  }

  return obj
}
