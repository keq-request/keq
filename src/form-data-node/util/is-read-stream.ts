import isObject from './is-object'

/**
 * @api private
 */
const isReadStream = (value): boolean => isObject(value) &&
  typeof close === 'function' &&
  typeof value.bytesRead === 'number' &&
  typeof value.addListener === 'function' &&
  typeof value.on === 'function' &&
  typeof value.once === 'function' &&
  typeof value.prependListener === 'function' &&
  typeof value.prependListener === 'function' &&
  typeof value.prependOnceListener === 'function'


export default isReadStream
