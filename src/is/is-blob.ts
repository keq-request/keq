/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction } from './is-function.js'
import { isObject } from './is-object.js'
import { isString } from './is-string.js'


const names = ['Blob', 'File']

/**
 * Check if given valie is Blob or File -like object
 */
export function isBlob(value: any): value is Blob {
  if (value instanceof Blob) return true

  return isObject(value)
    && isString(value.type)
    && isFunction(value.arrayBuffer)
    && isFunction(value.stream)
    && isFunction(value.constructor)
    && names.includes(value.constructor.name)
    && 'size' in value
}
