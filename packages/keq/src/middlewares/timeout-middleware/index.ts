import { TimeoutException } from '~/exception/index.js'
import { KeqMiddleware } from '~/middleware/types/index.js'

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
    let timer: ReturnType<typeof setTimeout> | undefined

    ctx.emitter.on('fetch:before', ({ context }) => {
      timer = setTimeout(() => {
        const err = new TimeoutException(`keq request timeout(${millisecond}ms)`)
        context.request.abort(err)
        context.emitter.emit('timeout', { context })
      }, millisecond)
    })

    ctx.emitter.on('fetch:after', () => {
      if (timer !== undefined) {
        clearTimeout(timer)
        timer = undefined
      }
    })

    await next()
  }
}
