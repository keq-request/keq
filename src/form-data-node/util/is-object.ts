/**
 * @api private
 */
const isObject = (value): boolean => typeof value === 'object' && value !== null

export default isObject
