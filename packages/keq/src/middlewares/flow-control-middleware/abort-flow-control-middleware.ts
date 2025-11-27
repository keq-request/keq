import { AbortException } from '~/exception/index.js'
import { KeqMiddleware } from '~/middleware/types/index.js'


export function keqAbortFlowControlMiddleware(): KeqMiddleware {
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
      const reason = new AbortException(`Previous request was aborted by AbortFlowControl with key "${key}"`)
      abort(reason)
    }

    const fn = ctx.request.abort.bind(ctx.request)
    ctx.global.abortFlowControl[key] = fn

    try {
      await next()
    } finally {
      if (ctx.global.abortFlowControl[key] === fn) {
        ctx.global.abortFlowControl[key] = undefined
      }
    }
  }
}
