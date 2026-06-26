import type { Type } from '@nestjs/common'
import type { ModuleRef } from '@nestjs/core'
import type { KeqExecutionContext, KeqMiddleware, KeqRoute } from 'keq'
import { composeRoute, KeqRequest } from 'keq'
import picomatch from 'picomatch'
import { KEQ_ROUTES } from './constants.js'
import type { KeqMiddlewareConfigProxy, KeqMiddlewareConsumer, KeqModuleClass, KeqRouteInfo } from './interfaces/keq-middleware-consumer.interface.js'
import type { KeqNestMiddleware } from './interfaces/keq-nest-middleware.interface.js'


interface MiddlewareEntry {
  middlewares: Array<Type<KeqNestMiddleware> | KeqMiddleware>
  routes: Array<typeof KEQ_ROUTES.ALL | KeqRouteInfo | KeqModuleClass>
  excludedRouteInfos?: KeqRouteInfo[]
}

export class KeqMiddlewareConsumerImpl implements KeqMiddlewareConsumer {
  private entries: MiddlewareEntry[] = []

  apply(...middlewares: Array<Type<KeqNestMiddleware> | KeqMiddleware>): KeqMiddlewareConfigProxy {
    const entry: MiddlewareEntry = { middlewares, routes: [] }
    const excludedRouteInfos: KeqRouteInfo[] = []
    this.entries.push(entry)

    const proxy: KeqMiddlewareConfigProxy = {
      exclude: (...routes) => {
        excludedRouteInfos.push(...routes)
        return proxy
      },
      forRoutes: (...routes) => {
        entry.routes = routes
        if (excludedRouteInfos.length > 0) {
          entry.excludedRouteInfos = excludedRouteInfos
        }
        return this
      },
    }
    return proxy
  }

  applyTo(keqRequest: KeqRequest, moduleRef: ModuleRef): void {
    for (const entry of this.entries) {
      let resolved = entry.middlewares.map((m) => this.resolveMiddleware(m, moduleRef))

      if (entry.excludedRouteInfos && entry.excludedRouteInfos.length > 0) {
        const excludedRoutes = entry.excludedRouteInfos.map((info) => this.buildRoute(info))
        resolved = resolved.map((mw) => this.wrapWithExclusion(mw, excludedRoutes))
      }

      const isGlobal = entry.routes.length === 0
        || entry.routes.some((r) => r === KEQ_ROUTES.ALL)

      if (isGlobal) {
        for (const mw of resolved) keqRequest.use(mw)
      } else {
        for (const routeTarget of entry.routes) {
          if (routeTarget === KEQ_ROUTES.ALL) continue

          if (this.isKeqModuleClass(routeTarget)) {
            const targetRequest = moduleRef.get<KeqRequest>(routeTarget.KEQ_REQUEST, { strict: false })
            if (targetRequest) {
              for (const mw of resolved) targetRequest.use(mw)
            }
          } else {
            const route = this.buildRoute(routeTarget as KeqRouteInfo)
            keqRequest.useRouter().route(route, resolved)
          }
        }
      }
    }
  }

  private isKeqModuleClass(route: unknown): route is KeqModuleClass {
    return (
      typeof route === 'function'
      && 'KEQ_REQUEST' in route
      && typeof (route as Record<string, unknown>).KEQ_REQUEST === 'symbol'
    )
  }

  private isNestMiddlewareClass(m: Type<KeqNestMiddleware> | KeqMiddleware): m is Type<KeqNestMiddleware> {
    return typeof m === 'function' && m.prototype !== undefined && 'use' in m.prototype
  }

  private resolveMiddleware(m: Type<KeqNestMiddleware> | KeqMiddleware, moduleRef: ModuleRef): KeqMiddleware {
    if (this.isNestMiddlewareClass(m)) {
      const instance = moduleRef.get<KeqNestMiddleware>(m, { strict: false })
      return async (ctx, next) => {
        await instance.use(ctx, next)
      }
    }
    return m
  }

  private buildRoute(info: KeqRouteInfo): KeqRoute {
    const routes: KeqRoute[] = []
    if (info.host) {
      const host = info.host
      routes.push((ctx) => ctx.request.url.host === host)
    }
    if (info.method) {
      const method = info.method.toLowerCase()
      routes.push((ctx) => ctx.request.method.toLowerCase() === method)
    }
    if (info.pathname) {
      const isMatch: (test: string) => boolean = picomatch(info.pathname)
      routes.push((ctx) => isMatch(ctx.request.url.pathname))
    }
    if (routes.length === 1) return routes[0]
    return composeRoute(routes)
  }

  private wrapWithExclusion(middleware: KeqMiddleware, excludedRoutes: KeqRoute[]): KeqMiddleware {
    const excluded: KeqMiddleware = async (ctx, next) => {
      if (await this.checkExcluded(ctx, excludedRoutes)) {
        return next()
      }
      return middleware(ctx, next)
    }
    return excluded
  }

  private async checkExcluded(ctx: KeqExecutionContext, excludedRoutes: KeqRoute[]): Promise<boolean> {
    for (const route of excludedRoutes) {
      if (await route(ctx)) return true
    }
    return false
  }
}
