import { composeMiddleware } from '~/middleware'
import { KeqMiddleware } from '~/types/keq-middleware'
import { KeqRequestMethod } from '~/types/keq-request-method'
import { KeqRouter } from './keq-router'


export class KeqMethodRouter extends KeqRouter {
  method: string

  constructor(method: KeqRequestMethod, middlewares: KeqMiddleware[]) {
    super(middlewares)

    this.method = method
  }

  routes(): KeqMiddleware {
    return async (ctx, next) => {
      if (ctx.request.method.toLowerCase() === this.method) {
        await composeMiddleware(this.middlewares)(ctx, next)
      } else {
        await next()
      }
    }
  }
}
