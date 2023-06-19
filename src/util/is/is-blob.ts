import { isFunction } from './is-function'
import { isObject } from './is-object'
import { isString } from './is-string'


const names = ['Blob', 'File']

/**
 * Check if given valie is Blob or File -like object
 */
export function isBlob(value: any): value is Blob {
  return isObject(value)
    && isString(value.type)
    && isFunction(value.arrayBuffer)
    && isFunction(value.stream)
    && isFunction(value.constructor)
    && names.includes(value.constructor.name)
    && 'size' in value
}
