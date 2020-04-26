import readableStreamIterator from './readable-stream-iterator'
import isWHATWGReadable from './is-whatwg-readable'

/**
 * Returns stream iterator for given stream-like object
 *
 * @param {Readable | ReadableStream | ReadStream} value
 *
 * @api private
 */
function getStreamIterator(value): AsyncIterableIterator<any> {
  if (isWHATWGReadable(value)) {
    return readableStreamIterator(value.getReader())
  }

  return value
}


export default getStreamIterator
