import isFunction from './is-function'
import isString from './is-string'
import isObject from './is-object'

const names = ['Blob', 'File']

/**
 * Check if given valie is Blob or File -like object
 *
 * @param {any} value
 *
 * @return {boolean}
 *
 * @api private
 */
const isBlob = (value): boolean => (
  isObject(value)
    && isString(value.type)
    && isFunction(value.arrayBuffer)
    && isFunction(value.stream)
    && isFunction(value.constructor)
    && names.includes(value.constructor.name)
    && 'size' in value
)

export default isBlob
