import { isObject } from '~/is/is-object.js'

/**
 * @description 浅拷贝
 */
export function shadowClone<T = any>(obj: T): T {
  if (Array.isArray(obj)) {
    return [...obj] as T
  } else if (isObject(obj)) {
    return { ...obj }
  }

  return obj
}
