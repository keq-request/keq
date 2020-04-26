import isWHATWGReadable from './is-whatwg-readable'
import isReadStream from './is-read-stream'
import isReadable from './is-readable'

/**
 * Checks if given value is ONLY fs.ReadStream OR stream.Readable instance
 *
 * @param {any} value
 *
 * @return {boolean}
 *
 * @api private
 */
const isStream = (value): boolean => (
  isWHATWGReadable(value) || isReadStream(value) || isReadable(value)
)

export default isStream
