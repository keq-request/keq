import { KeqMiddleware } from '~/types/keq-middleware.js'


export function timeoutMiddleware(): KeqMiddleware {
  return async function timeoutMiddleware(ctx, next) {
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

    const millisecond = ctx.options.timeout.millisecond
    setTimeout(
      () => {
        const err = new DOMException(`keq request timeout(${millisecond}ms)`, 'AbortError')
        timeoutSignal.abort(err)
      },
      millisecond
    )

    await next()
  }
}
