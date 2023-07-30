/* eslint-disable @typescript-eslint/no-empty-function */
import { Exception } from '~/exception/exception'
import { KeqMiddleware } from './types/keq-middleware'


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
