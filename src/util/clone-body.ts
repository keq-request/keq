import deepClone from 'clone'
import fromEntries from 'object.fromentries'
import { isBlob } from '../is/is-blob'


export function cloneBody<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => (isBlob(item) ? item : cloneBody(item))) as unknown as T
  } else if (obj === null) {
    return null as unknown as T
  } else if (typeof obj === 'object') {
    const entries = Object.entries(obj)
      .map(([key, value]): [string, any] => ([
        key,
        isBlob(value) ? value : cloneBody(value),
      ]))

    return fromEntries(entries) as T
  }

  return deepClone(obj)
}
