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
    ctx.emitter.on('fetch', (ctx) => {
      setTimeout(
        () => {
          const err = new DOMException(`keq request timeout(${millisecond}ms)`, 'AbortError')
          ctx.request.abort(err)
        },
        millisecond,
      )
    })

    await next()
  }
}
