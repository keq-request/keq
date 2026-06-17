import type { KeqMiddleware } from '~/types/keq-middleware.js'


export function mutexFlowControlMiddleware(): KeqMiddleware {
  return async function mutexFlowControlMiddleware(ctx, next) {
    if (!ctx.options.flowControl || ctx.options.flowControl.mode !== 'mutex') {
      await next()
      return
    }

    const { signal } = ctx.options.flowControl

    const key = typeof signal === 'string' ? signal : signal(ctx)

    if (!ctx.global.mutexFlowControl) ctx.global.mutexFlowControl = {}

    if (ctx.global.mutexFlowControl[key]) {
      throw new DOMException('A request with the same signal is already in progress, keq flowControl mutex rejected this request.', 'AbortError')
    }

    ctx.global.mutexFlowControl[key] = true

    try {
      await next()
    } finally {
      ctx.global.mutexFlowControl[key] = false
    }
  }
}
