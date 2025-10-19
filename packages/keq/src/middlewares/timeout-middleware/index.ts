import { TimeoutException } from '~/exception/index.js'
import { KeqMiddleware } from '~/middleware/types'

export interface KeqTimeoutOptions {
  millisecond: number
}

export function keqTimeoutMiddleware(): KeqMiddleware {
  return async function timeoutMiddleware(ctx, next) {
    if (!ctx.options.timeout || ctx.options.timeout.millisecond <= 0) {
      await next()
      return
    }

    const millisecond = ctx.options.timeout.millisecond
    ctx.emitter.on('fetch:after', ({ context }) => {
      setTimeout(
        () => {
          const err = new TimeoutException(`keq request timeout(${millisecond}ms)`)
          context.request.abort(err)
          context.emitter.emit('timeout', { context })
        },
        millisecond,
      )
    })

    await next()
  }
}
