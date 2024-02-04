import { KeqMiddleware } from '~/types/keq-middleware.js'


export function timeoutMiddleware(): KeqMiddleware {
  return async (ctx, next) => {
    if (!ctx.options.timeout || ctx.options.timeout.millisecond <= 0) {
      await next()
      return
    }

    if (ctx.request.signal) {
      console.warn('[keq] request signal had be set manual, abort follow control will not take effect')
      await next()
      return
    }

    const timeoutSignal = new AbortController()
    ctx.request.signal = timeoutSignal.signal

    setTimeout(
      () => {
        timeoutSignal.abort('timeout')
      },
      ctx.options.timeout.millisecond
    )

    await next()
  }
}
