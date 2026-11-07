import { ABORT_PROPERTY } from '../constant.js'

import type { KeqMiddleware } from '~/types/keq-middleware.js'


export function timeoutMiddleware(): KeqMiddleware {
  return async function timeoutMiddleware(ctx, next) {
    if (!ctx.options.timeout || ctx.options.timeout.millisecond <= 0) {
      await next()
      return
    }

    const millisecond = ctx.options.timeout.millisecond
    ctx.emitter.on('fetch', (ctx) => {
      setTimeout(
        () => {
          const err = new DOMException(`keq request timeout(${millisecond}ms)`, 'AbortError')
          // Only abort the current attempt, so that the retry middleware can retry
          ctx[ABORT_PROPERTY]?.abort(err)
        },
        millisecond,
      )
    })

    await next()
  }
}
