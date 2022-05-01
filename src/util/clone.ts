import { isBlob } from './is'
import deepClone from 'clone'
import fromEntries from 'object.fromentries'


export function clone<T>(obj: T): T {
  if (typeof obj === 'object' && !Array.isArray(obj)) {
    const entries = Object.entries(obj)
      .map(([key, value]): [string, any] => ([
        key,
        isBlob(value) ? value : deepClone(value),
      ]))

    return fromEntries(entries) as T
  }

  return deepClone(obj)
}
