import { KeqContext } from '~/context/context.js'
import { KeqMiddleware } from '~/middleware/types'

/**
 * Send Request
 */
export function keqFetchMiddleware(): KeqMiddleware {
  return async function fetchMiddleware(context: KeqContext) {
    const fetch = context.options.fetchAPI || globalThis.fetch

    context.emitter.emit('fetch:before', { context })
    const response = await fetch(...context.request.toFetchArguments())
    context.emitter.emit('fetch:after', { context })

    context.res = response
  }
}
