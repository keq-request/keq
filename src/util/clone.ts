/* eslint-disable @typescript-eslint/no-unsafe-return */
import deepClone from 'clone'
import fromEntries from 'object.fromentries'
import { isBlob } from '~/is/is-blob'


export function clone<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => (isBlob(item) ? item : clone(item))) as unknown as T
  } else if (obj === null) {
    return null as unknown as T
  } else if (typeof obj === 'object') {
    const entries = Object.entries(obj)
      .map(([key, value]): [string, any] => ([
        key,
        isBlob(value) ? value : clone(value),
      ]))

    return fromEntries(entries) as T
  }

  return deepClone(obj)
}
