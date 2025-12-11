import { TypeException } from '~/exception/type.exception.js'
import { keqHostRoute } from './keq-host-route.js'
import { keqLocationRoute } from './keq-location-route.js'
import { keqMethodRoute } from './keq-method-route.js'
import { keqModuleRoute } from './keq-module-route.js'
import { keqPathnameRoute } from './keq-pathname-route.js'
import { composeMiddleware, getMiddlewareName } from '~/middleware/index.js'

import type { KeqMiddleware } from '~/middleware/index.js'
import type { KeqRoute } from '~/router/types/keq-route.js'


export class KeqRouter {
  constructor(
    private readonly middlewares: KeqMiddleware[] = [],
  ) { }

  private buildMiddleware(route: KeqRoute, middlewares: KeqMiddleware[]): KeqMiddleware {
    if (middlewares.length === 0) {
      throw new TypeException('At least one middleware is required to build a route middleware')
    }

    const composedMiddleware = middlewares.length > 1 ? composeMiddleware(middlewares) : middlewares[0]

    const middleware: KeqMiddleware = async function router(ctx, next) {
      if (route(ctx)) await composedMiddleware(ctx, next)
      else await next()
    }

    return middleware
  }

  route(route: KeqRoute, ...middlewares: KeqMiddleware[]): this {
    const middleware = this.buildMiddleware(route, middlewares)
    middleware.__keqMiddlewareName__ = `route(${route.__keqRouteName__ || route.name}, ${middlewares.map(getMiddlewareName).join(', ')})`
    this.middlewares.push(middleware)
    return this
  }

  host(host: string, ...middlewares: KeqMiddleware[]): this {
    const middleware = this.buildMiddleware(keqHostRoute(host), middlewares)
    middleware.__keqMiddlewareName__ = `host(${JSON.stringify(host)}, ${middlewares.map(getMiddlewareName).join(', ')})`
    this.middlewares.push(middleware)
    return this
  }

  method(method: string, ...middlewares: KeqMiddleware[]): this {
    const middleware = this.buildMiddleware(keqMethodRoute(method), middlewares)
    middleware.__keqMiddlewareName__ = `method(${JSON.stringify(method)}, ${middlewares.map(getMiddlewareName).join(', ')})`
    this.middlewares.push(middleware)
    return this
  }

  pathname(pathname: string, ...middlewares: KeqMiddleware[]): this {
    const middleware = this.buildMiddleware(keqPathnameRoute(pathname), middlewares)
    middleware.__keqMiddlewareName__ = `pathname(${JSON.stringify(pathname)}, ${middlewares.map(getMiddlewareName).join(', ')})`
    this.middlewares.push(middleware)
    return this
  }

  location(...middlewares: KeqMiddleware[]): this {
    const middleware = this.buildMiddleware(keqLocationRoute(), middlewares)
    middleware.__keqMiddlewareName__ = `location(${middlewares.map(getMiddlewareName).join(', ')})`
    this.middlewares.push(middleware)
    return this
  }

  module(moduleName: string, ...middlewares: KeqMiddleware[]): this {
    const middleware = this.buildMiddleware(keqModuleRoute(moduleName), middlewares)
    middleware.__keqMiddlewareName__ = `module(${JSON.stringify(moduleName)}, ${middlewares.map(getMiddlewareName).join(', ')})`
    this.middlewares.push(middleware)
    return this
  }
}
