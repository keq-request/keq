import { KeqContext } from '~/context/context.js'
import { KeqMiddleware } from '~/middleware/types'

/**
 * Send Request
 */
export function keqFetchMiddleware(): KeqMiddleware {
  return async function fetchMiddleware(ctx: KeqContext) {
    ctx.emitter.emit('fetch', ctx)
    const fetch = ctx.options.fetchAPI || globalThis.fetch

    const response = await fetch(...ctx.request.toFetchArguments())
    ctx.res = response
  }
}
