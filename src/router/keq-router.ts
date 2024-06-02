import { KeqMiddleware } from '~/types/keq-middleware'
import { KeqRoute } from '~/types/keq-route.js'
import { composeMiddleware } from '~/util/compose-middleware.js'
import { keqHostRoute } from './keq-host-route.js'
import { keqLocationRoute } from './keq-location-route.js'
import { keqMethodRoute } from './keq-method-route.js'
import { keqModuleRoute } from './keq-module-route.js'
import { keqPathnameRoute } from './keq-pathname-route.js'


export class KeqRouter {
  constructor(
    private readonly prependMiddlewares: KeqMiddleware[] = []
  ) { }

  route(route: KeqRoute, ...middlewares: KeqMiddleware[]): this {
    if (middlewares.length === 0) return this
    const m = middlewares.length > 1 ? composeMiddleware(middlewares) : middlewares[0]

    this.prependMiddlewares.push(async function router(ctx, next) {
      if (route(ctx)) await m(ctx, next)
      else await next()
    })

    return this
  }

  host(host: string, ...middlewares: KeqMiddleware[]): this {
    return this.route(keqHostRoute(host), ...middlewares)
  }

  method(method: string, ...middlewares: KeqMiddleware[]): this {
    return this.route(keqMethodRoute(method), ...middlewares)
  }

  pathname(pathname: string, ...middlewares: KeqMiddleware[]): this {
    return this.route(keqPathnameRoute(pathname), ...middlewares)
  }

  location(...middlewares: KeqMiddleware[]): this {
    return this.route(keqLocationRoute(), ...middlewares)
  }

  module(moduleName: string, ...middlewares: KeqMiddleware[]): this {
    return this.route(keqModuleRoute(moduleName), ...middlewares)
  }
}
