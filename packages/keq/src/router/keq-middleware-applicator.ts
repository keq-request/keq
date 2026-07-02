import { composeMiddleware } from '~/middleware/index.js'
import { buildRoute } from './utils/build-route.js'
import { composeRoute } from './utils/compose-route.js'
import { notRoute } from './utils/not-route.js'
import { orRoute } from './utils/or-route.js'

import type { KeqMiddleware } from '~/middleware/index.js'
import type { KeqRoute } from './types/keq-route.js'
import type { KeqRoutePattern } from './types/keq-route-pattern.js'


export type KeqRouteTarget = KeqRoutePattern | KeqRoute

function normalizeTarget(target: KeqRouteTarget): KeqRoute {
  if (typeof target === 'function') return target
  return buildRoute(target)
}

export class KeqMiddlewareApplicator<TReturn> {
  private readonly excludedTargets: KeqRouteTarget[] = []

  constructor(
    private readonly middlewares: KeqMiddleware[],
    private readonly registeredMiddlewares: KeqMiddleware[],
    private readonly returnValue: TReturn,
  ) {}

  exclude(...routes: KeqRouteTarget[]): this {
    this.excludedTargets.push(...routes)
    return this
  }

  forRoutes(...routes: KeqRouteTarget[]): TReturn {
    const inclusionRoutes = routes.map(normalizeTarget)
    const inclusionRoute = inclusionRoutes.length === 1
      ? inclusionRoutes[0]
      : orRoute(inclusionRoutes)

    let finalRoute: KeqRoute
    if (this.excludedTargets.length > 0) {
      const exclusionRoutes = this.excludedTargets.map(normalizeTarget)
      const exclusionRoute = exclusionRoutes.length === 1
        ? exclusionRoutes[0]
        : orRoute(exclusionRoutes)
      finalRoute = composeRoute([inclusionRoute, notRoute(exclusionRoute)])
    } else {
      finalRoute = inclusionRoute
    }

    const composedMiddleware = this.middlewares.length > 1
      ? composeMiddleware(this.middlewares)
      : this.middlewares[0]

    const routeMiddleware: KeqMiddleware = async function routeApply(ctx, next) {
      if (await finalRoute(ctx)) await composedMiddleware(ctx, next)
      else await next()
    }

    this.registeredMiddlewares.push(routeMiddleware)
    return this.returnValue
  }

  forAllRoutes(): TReturn {
    const composedMiddleware = this.middlewares.length > 1
      ? composeMiddleware(this.middlewares)
      : this.middlewares[0]

    if (this.excludedTargets.length > 0) {
      const exclusionRoutes = this.excludedTargets.map(normalizeTarget)
      const exclusionRoute = exclusionRoutes.length === 1
        ? exclusionRoutes[0]
        : orRoute(exclusionRoutes)
      const finalRoute = notRoute(exclusionRoute)

      const routeMiddleware: KeqMiddleware = async function routeApply(ctx, next) {
        if (await finalRoute(ctx)) await composedMiddleware(ctx, next)
        else await next()
      }

      this.registeredMiddlewares.push(routeMiddleware)
    } else {
      this.registeredMiddlewares.push(composedMiddleware)
    }

    return this.returnValue
  }
}
