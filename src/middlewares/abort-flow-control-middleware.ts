import type { KeqMiddleware } from '~/types/keq-middleware.js'


export function abortFlowControlMiddleware(): KeqMiddleware {
  return async function abortFlowControlMiddleware(ctx, next) {
    if (!ctx.options.flowControl || ctx.options.flowControl.mode !== 'abort') {
      await next()
      return
    }

    const { signal } = ctx.options.flowControl

    const key = typeof signal === 'string' ? signal : signal(ctx)

    if (!ctx.global.abortFlowControl) ctx.global.abortFlowControl = {}

    const abort = ctx.global.abortFlowControl[key]
    if (abort) {
      const reason = new DOMException('The previous request was not completed, so keq flowControl abort this request.', 'AbortError')
      abort(reason)
    }

    ctx.global.abortFlowControl[key] = ctx.abort.bind(ctx)

    try {
      await next()
    } finally {
      ctx.global.abortFlowControl[key] = undefined
    }
  }
}
