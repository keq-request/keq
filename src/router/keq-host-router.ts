import { composeMiddleware } from '~/middleware'
import { KeqMiddleware } from '~/types/keq-middleware'
import { KeqRouter } from './keq-router'


export class KeqHostRouter extends KeqRouter {
  host: string

  constructor(host: string, middlewares: KeqMiddleware[]) {
    super(middlewares)

    this.host = host
  }

  routes(): KeqMiddleware {
    return async (ctx, next) => {
      if (ctx.request.url.host === this.host) {
        await composeMiddleware(this.middlewares)(ctx, next)
      } else {
        await next()
      }
    }
  }
}
