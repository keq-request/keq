import { Exception } from '~/exception/exception'
import { KeqContext } from '~/types/keq-context'
import { KeqMiddleware } from '~/types/keq-middleware'

/**
 * Send Request
 */
export function fetchMiddleware(): KeqMiddleware {
  return async function fetchMiddleware(ctx: KeqContext) {
    const fetchArguments = ctx.fetchArguments
    if (!fetchArguments) {
      throw new Exception('fetchArguments is required')
    }

    const fetch = ctx.options.fetchAPI || globalThis.fetch

    const response = await fetch(...fetchArguments)
    ctx.res = response
  }
}
