import { Exception } from '~/exception/exception.js'

import type { KeqMiddleware } from '../types/keq-middleware.js'


export function composeMiddleware(middlewares: KeqMiddleware[]): KeqMiddleware {
  if (!middlewares.length) {
    throw new Exception('At least one middleware')
  }

  const middleware = middlewares
    .reverse()
    .reduce(function (prev, curr): KeqMiddleware {
      return (ctx, next) => curr(ctx, () => prev(ctx, next))
    })

  return middleware
}
