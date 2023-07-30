import { isBrowser } from '~/is/is-browser'
import { composeMiddleware } from '~/middleware'
import { KeqMiddleware } from '~/types/keq-middleware'
import { KeqRouter } from './keq-router'


export class KeqLocationRouter extends KeqRouter {
  constructor(middlewares: KeqMiddleware[]) {
    super(middlewares)
  }

  routes(): KeqMiddleware {
    return async (ctx, next) => {
      if (isBrowser() && ctx.request.url.host === window.location.host) {
        await composeMiddleware(this.middlewares)(ctx, next)
      } else {
        await next()
      }
    }
  }
}
