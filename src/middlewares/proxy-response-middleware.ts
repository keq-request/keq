import { KeqMiddleware } from '../types/keq-middleware'


export function proxyResponseMiddleware(): KeqMiddleware {
  return async function proxyResponseMiddleware(ctx, next) {
    await next()

    const res = ctx.res

    if (res && !('response' in ctx)) {
      Object.defineProperty(ctx, 'response', {
        get() {
          return ctx.res?.clone()
        },
      })
    }
  }
}
