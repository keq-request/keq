import { isBlob } from './is'
import * as deepClone from 'clone'
import * as fromEntries from 'object.fromentries'


export function clone<T>(obj: T): T {
  if (typeof obj === 'object' && !Array.isArray(obj)) {
    const entries = Object.entries(obj)
      .map(([key, value]): [string, any] => ([
        key,
        isBlob(value) ? value : deepClone(value),
      ]))

    return fromEntries(entries) as T
  }

  return deepClone(obj) as T
}
