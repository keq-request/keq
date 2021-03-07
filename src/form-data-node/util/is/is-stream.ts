import { isWHATWGReadable } from './is-whatwg-readable'
import { isReadStream } from './is-read-stream'
import { isReadable } from './is-readable'

/**
 * Checks if given value is ONLY fs.ReadStream OR stream.Readable instance
 */
export function isStream(value): boolean {
  return isWHATWGReadable(value) || isReadStream(value) || isReadable(value)
}
