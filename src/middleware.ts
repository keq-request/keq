import {
  Context,
  InnerMiddleware,
  Middleware,
  MiddlewareMatcher,
} from '@/types'
import { Exception } from '@/exception'


export const matchHost = (host: string): MiddlewareMatcher => ctx => ctx.request.url.host === host
export function matchMiddleware(matcher: MiddlewareMatcher, middleware: Middleware): Middleware {
  return async(ctx, next) => {
    if (matcher(ctx)) await middleware(ctx, next)
    else await next()
  }
}
export function wrapMiddleware(middleware: Middleware, ctx: Context, next: InnerMiddleware): InnerMiddleware {
  return async() => {
    await middleware(ctx, next)
  }
}

export function compose(middlewares: Middleware[]): Middleware {
  if (!middlewares.length) throw new Exception('At least one middleware')

  let result: Middleware = middlewares[0]
  const len = middlewares.length

  for (let i = 1; i < len; i++) {
    const last = result
    result = async function(ctx, next) {
      const inner = wrapMiddleware(middlewares[i], ctx, next)
      await last(ctx, inner)
    }
  }

  return result
}
