import { Readable } from 'stream'

/**
 * @api private
 */
const isReadable = (val): boolean => val instanceof Readable

export default isReadable
