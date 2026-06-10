import { MutexException } from '~/exception/index.js'
import { KeqMiddleware } from '~/middleware/types/index.js'


export function keqMutexFlowControlMiddleware(): KeqMiddleware {
  return async function mutexFlowControlMiddleware(ctx, next) {
    if (!ctx.options.flowControl || ctx.options.flowControl.mode !== 'mutex') {
      await next()
      return
    }

    const { signal } = ctx.options.flowControl

    const key = typeof signal === 'string' ? signal : signal(ctx)

    if (!ctx.global.core) ctx.global.core = {}
    if (!ctx.global.core.mutexFlowControl) ctx.global.core.mutexFlowControl = new Set()

    if (ctx.global.core.mutexFlowControl.has(key)) {
      throw new MutexException(`Request rejected by MutexFlowControl: a request with key "${key}" is already in-flight`)
    }

    ctx.global.core.mutexFlowControl.add(key)

    try {
      await next()
    } finally {
      ctx.global.core.mutexFlowControl.delete(key)
    }
  }
}
