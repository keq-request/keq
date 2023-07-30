import { minimatch } from 'minimatch'
import { composeMiddleware } from '~/middleware'
import { KeqMiddleware } from '~/types/keq-middleware'
import { KeqRouter } from './keq-router'


export class KeqPathnameRouter extends KeqRouter {
  pathname: string

  constructor(pathname: string, middlewares: KeqMiddleware[]) {
    super(middlewares)

    this.pathname = pathname
  }

  routes(): KeqMiddleware {
    return async (ctx, next) => {
      if (minimatch(ctx.request.url.pathname, this.pathname)) {
        await composeMiddleware(this.middlewares)(ctx, next)
      } else {
        await next()
      }
    }
  }
}

