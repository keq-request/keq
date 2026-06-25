import { createResponseProxy } from '~/util/create-response-proxy.js'
import type { KeqMiddleware } from '../types/keq-middleware.js'


export function proxyResponseMiddleware(): KeqMiddleware {
  return async function proxyResponseMiddleware(ctx, next) {
    await next()

    const res = ctx.res

    if (res) ctx.response = createResponseProxy(res)
  }
}
