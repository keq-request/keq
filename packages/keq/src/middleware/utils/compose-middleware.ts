import { TypeException } from '~/exception/index.js'
import type { KeqMiddleware } from '../types/keq-middleware.js'
import { getMiddlewareName } from './get-middleware-name.js'


interface ComposeMiddlewareOptions {
  name?: string
}

export function composeMiddleware(middlewares: KeqMiddleware[], options?: ComposeMiddlewareOptions): KeqMiddleware {
  if (!middlewares.length) {
    throw new TypeException('At least one middleware')
  }

  const middleware = [...middlewares]
    .reverse()
    .reduce(function (prev, curr): KeqMiddleware {
      return async (ctx, next) => {
        await curr(ctx, async () => prev(ctx, next))
      }
    })

  if (options?.name) {
    middleware.__keqMiddlewareName__ = options.name
  } else {
    middleware.__keqMiddlewareName__ = `composeMiddleware(${middlewares.map((i) => getMiddlewareName(i)).join(', ')})`
  }

  return middleware
}
