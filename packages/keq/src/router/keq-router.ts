import { TypeException } from '~/exception/type.exception.js'
import { keqHostRoute } from './keq-host-route.js'
import { keqLocationRoute } from './keq-location-route.js'
import { keqMethodRoute } from './keq-method-route.js'
import { keqPathnameRoute } from './keq-pathname-route.js'
import { composeMiddleware, getMiddlewareName } from '~/middleware/index.js'

import type { KeqMiddleware } from '~/middleware/index.js'
import type { KeqRoute } from '~/router/types/keq-route.js'


export class KeqRouter {
  constructor(
    private readonly middlewares: KeqMiddleware[] = [],
  ) { }

  private static buildMiddleware(route: KeqRoute, middlewares: KeqMiddleware[]): KeqMiddleware {
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

  route(route: KeqRoute, middleware: KeqMiddleware[]): this
  route(route: KeqRoute, middleware: KeqMiddleware, ...additionalMiddlewares: KeqMiddleware[]): this
  route(route: KeqRoute, middleware: KeqMiddleware | KeqMiddleware[], ...additionalMiddlewares: KeqMiddleware[]): this {
    // @ts-ignore
    const mid = KeqRouter.route(route, middleware, ...additionalMiddlewares)
    this.middlewares.push(mid)
    return this
  }

  host(host: string, middleware: KeqMiddleware[]): this
  host(host: string, middleware: KeqMiddleware, ...additionalMiddlewares: KeqMiddleware[]): this
  host(host: string, middleware: KeqMiddleware | KeqMiddleware[], ...additionalMiddlewares: KeqMiddleware[]): this {
    // @ts-ignore
    const mid = KeqRouter.host(host, middleware, ...additionalMiddlewares)
    this.middlewares.push(mid)
    return this
  }

  method(method: string, middleware: KeqMiddleware[]): this
  method(method: string, middleware: KeqMiddleware, ...additionalMiddlewares: KeqMiddleware[]): this
  method(method: string, middleware: KeqMiddleware | KeqMiddleware[], ...additionalMiddlewares: KeqMiddleware[]): this {
    // @ts-ignore
    const mid = KeqRouter.method(method, middleware, ...additionalMiddlewares)
    this.middlewares.push(mid)
    return this
  }

  pathname(pathname: string, middleware: KeqMiddleware[]): this
  pathname(pathname: string, middleware: KeqMiddleware, ...additionalMiddlewares: KeqMiddleware[]): this
  pathname(pathname: string, middleware: KeqMiddleware | KeqMiddleware[], ...additionalMiddlewares: KeqMiddleware[]): this {
    // @ts-ignore
    const mid = KeqRouter.pathname(pathname, middleware, ...additionalMiddlewares)
    this.middlewares.push(mid)
    return this
  }

  location(middleware: KeqMiddleware[]): this
  location(middleware: KeqMiddleware, ...additionalMiddlewares: KeqMiddleware[]): this
  location(middleware: KeqMiddleware | KeqMiddleware[], ...additionalMiddlewares: KeqMiddleware[]): this {
    // @ts-ignore
    const mid = KeqRouter.location(middleware, ...additionalMiddlewares)
    this.middlewares.push(mid)
    return this
  }

  static route(route: KeqRoute, middleware: KeqMiddleware[]): KeqMiddleware
  static route(route: KeqRoute, middleware: KeqMiddleware, ...additionalMiddlewares: KeqMiddleware[]): KeqMiddleware
  static route(route: KeqRoute, middleware: KeqMiddleware | KeqMiddleware[], ...additionalMiddlewares: KeqMiddleware[]): KeqMiddleware {
    const list = Array.isArray(middleware) ? middleware : [middleware, ...additionalMiddlewares]
    const mid = KeqRouter.buildMiddleware(route, list)
    mid.__keqMiddlewareName__ = `route(${route.__keqRouteName__ || route.name}, ${list.map(getMiddlewareName).join(', ')})`
    return mid
  }


  static host(host: string, middleware: KeqMiddleware[]): KeqMiddleware
  static host(host: string, middleware: KeqMiddleware, ...additionalMiddlewares: KeqMiddleware[]): KeqMiddleware
  static host(host: string, middleware: KeqMiddleware | KeqMiddleware[], ...additionalMiddlewares: KeqMiddleware[]): KeqMiddleware {
    const list = Array.isArray(middleware) ? middleware : [middleware, ...additionalMiddlewares]
    const mid = KeqRouter.buildMiddleware(keqHostRoute(host), list)
    mid.__keqMiddlewareName__ = `host(${JSON.stringify(host)}, ${list.map(getMiddlewareName).join(', ')})`
    return mid
  }

  static method(method: string, middleware: KeqMiddleware[]): KeqMiddleware
  static method(method: string, middleware: KeqMiddleware, ...additionalMiddlewares: KeqMiddleware[]): KeqMiddleware
  static method(method: string, middleware: KeqMiddleware | KeqMiddleware[], ...additionalMiddlewares: KeqMiddleware[]): KeqMiddleware {
    const list = Array.isArray(middleware) ? middleware : [middleware, ...additionalMiddlewares]
    const mid = KeqRouter.buildMiddleware(keqMethodRoute(method), list)
    mid.__keqMiddlewareName__ = `method(${JSON.stringify(method)}, ${list.map(getMiddlewareName).join(', ')})`
    return mid
  }


  static pathname(pathname: string, middleware: KeqMiddleware[], ...additionalMiddlewares: KeqMiddleware[]): KeqMiddleware
  static pathname(pathname: string, middleware: KeqMiddleware, ...additionalMiddlewares: KeqMiddleware[]): KeqMiddleware
  static pathname(pathname: string, middleware: KeqMiddleware | KeqMiddleware[], ...additionalMiddlewares: KeqMiddleware[]): KeqMiddleware {
    const list = Array.isArray(middleware) ? middleware : [middleware, ...additionalMiddlewares]
    const mid = KeqRouter.buildMiddleware(keqPathnameRoute(pathname), list)
    mid.__keqMiddlewareName__ = `pathname(${JSON.stringify(pathname)}, ${list.map(getMiddlewareName).join(', ')})`
    return mid
  }

  static location(middleware: KeqMiddleware[]): KeqMiddleware
  static location(middleware: KeqMiddleware, ...additionalMiddlewares: KeqMiddleware[]): KeqMiddleware
  static location(middleware: KeqMiddleware | KeqMiddleware[], ...additionalMiddlewares: KeqMiddleware[]): KeqMiddleware {
    const list = Array.isArray(middleware) ? middleware : [middleware, ...additionalMiddlewares]
    const mid = KeqRouter.buildMiddleware(keqLocationRoute(), list)
    mid.__keqMiddlewareName__ = `location(${list.map(getMiddlewareName).join(', ')})`
    return mid
  }

}
