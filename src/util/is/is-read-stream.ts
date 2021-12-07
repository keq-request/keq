import { isObject } from './is-object'

export function isReadStream(value): boolean {
  return isObject(value) &&
  typeof close === 'function' &&
  typeof value.bytesRead === 'number' &&
  typeof value.addListener === 'function' &&
  typeof value.on === 'function' &&
  typeof value.once === 'function' &&
  typeof value.prependListener === 'function' &&
  typeof value.prependListener === 'function' &&
  typeof value.prependOnceListener === 'function'
}

