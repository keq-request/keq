import { isFunction } from './is-function'
import { isObject } from './is-object'

/**
 * Check if given value is ReadableStream
 *
 * @param {any} value
 *
 * @return {boolean}
 *
 * @api private
 */
export function isWHATWGReadable(value): boolean {
  return isObject(value)
    && isFunction(value.cancel)
    && isFunction(value.getReader)
    && isFunction(value.pipeTo)
    && isFunction(value.pipeThrough)
    && isFunction(value.constructor)
    && value.constructor.name === 'ReadableStream'
}
