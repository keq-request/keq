/* eslint-disable @typescript-eslint/no-unsafe-return */
import { KeqMiddleware } from '../types/keq-middleware'


export function proxyResponseMiddleware(): KeqMiddleware {
  return async (ctx, next) => {
    await next()

    const res = ctx.res

    if (res) {
      Object.defineProperty(ctx, 'response', {
        get() {
          return res.clone()
        },
      })
    }
  }
}
