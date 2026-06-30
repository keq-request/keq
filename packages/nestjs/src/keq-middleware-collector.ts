import type { KeqExecutionContext, KeqMiddleware, KeqRoute } from 'keq'
import { composeRoute, KeqRequest } from 'keq'
import picomatch from 'picomatch'
import { KEQ_ROUTES } from './constants.js'
import type { KeqMiddlewareConfigProxy, KeqRouteTarget, KeqRouteInfo } from './interfaces/keq-middleware-consumer.interface.js'
import type { KeqNestMiddleware } from './interfaces/keq-nest-middleware.interface.js'


/** 单条中间件注册条目 */
interface MiddlewareEntry {
  middlewares: Array<KeqNestMiddleware | KeqMiddleware>
  routes: KeqRouteTarget[]
  excludedRouteInfos?: KeqRouteInfo[]
}

/**
 * 中间件收集器，收集中间件配置条目并应用到指定的 {@link KeqRequest} 实例。
 *
 * 通过 `apply()` → `forRoutes()` 链式 API 收集多组中间件条目，
 * 在 `forRoutes()` 被调用时立即将中间件绑定到目标请求。
 *
 * 注意：该类并非 `@Injectable()`，由 Consumer 内部手动创建。
 *
 * @typeParam TConsumer - Consumer 类型（`KeqMiddlewareConsumer` 或 `KeqConsumer<T>`）
 */
export class KeqMiddlewareCollector<TConsumer extends object = object> {
  private entries: MiddlewareEntry[] = []

  constructor(
    private readonly keqRequest: KeqRequest,
    private readonly consumer: TConsumer,
  ) {}

  apply(
    middlewares: Array<KeqNestMiddleware | KeqMiddleware>,
  ): KeqMiddlewareConfigProxy {
    const entry: MiddlewareEntry = { middlewares, routes: [] }
    const excludedRouteInfos: KeqRouteInfo[] = []
    this.entries.push(entry)

    const { keqRequest, consumer } = this

    const proxy = {
      exclude: (...routes: KeqRouteInfo[]) => {
        excludedRouteInfos.push(...routes)
        return proxy
      },
      forRoutes: (...routes: KeqRouteTarget[]) => {
        entry.routes = routes
        if (excludedRouteInfos.length > 0) {
          entry.excludedRouteInfos = excludedRouteInfos
        }
        this.applyTo(keqRequest)
        return consumer
      },
    }
    return proxy as unknown as KeqMiddlewareConfigProxy
  }

  /**
   * 将收集的所有中间件条目解析并应用到指定的 {@link KeqRequest} 实例。
   */
  applyTo(keqRequest: KeqRequest): void {
    for (const entry of this.entries) {
      let resolved = entry.middlewares.map((m) => this.normalizeMiddleware(m))

      if (entry.excludedRouteInfos && entry.excludedRouteInfos.length > 0) {
        const excludedRoutes = entry.excludedRouteInfos.map((info) => this.buildRoute(info))
        resolved = resolved.map((mw) => this.wrapWithExclusion(mw, excludedRoutes))
      }

      const isGlobal
        = entry.routes.length === 0 || entry.routes.some((r) => r === KEQ_ROUTES.ALL)

      if (isGlobal) {
        for (const mw of resolved) keqRequest.use(mw)
      } else {
        for (const routeTarget of entry.routes) {
          if (routeTarget === KEQ_ROUTES.ALL) continue
          const route = this.buildRoute(routeTarget as KeqRouteInfo)
          keqRequest.useRouter().route(route, resolved)
        }
      }
    }
  }

  // ─── 中间件标准化 ────────────────────────────────────

  /**
   * 标准化中间件：将不同形式的中间件统一为 {@link KeqMiddleware} 函数。
   * - 若已是 {@link KeqMiddleware} 函数 → 直接返回
   * - 若为 {@link KeqNestMiddleware} 实例对象 → 包装 `use` 方法为中间件函数
   */
  private normalizeMiddleware(
    m: KeqNestMiddleware | KeqMiddleware,
  ): KeqMiddleware {
    if (this.isNestMiddlewareInstance(m)) {
      return async (ctx, next) => {
        await m.use(ctx, next)
      }
    }
    return m
  }

  private isNestMiddlewareInstance(
    m: KeqNestMiddleware | KeqMiddleware,
  ): m is KeqNestMiddleware {
    return typeof m === 'object' && m !== null && 'use' in m
  }

  // ─── 路由构建 ─────────────────────────────────────────

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

  private async checkExcluded(
    ctx: KeqExecutionContext,
    excludedRoutes: KeqRoute[],
  ): Promise<boolean> {
    for (const route of excludedRoutes) {
      if (await route(ctx)) return true
    }
    return false
  }
}
