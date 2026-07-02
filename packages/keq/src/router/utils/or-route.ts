import { Exception } from '~/exception/exception.js'
import type { KeqRoute } from '~/router/types/keq-route.js'


export function orRoute(routes: KeqRoute[]): KeqRoute {
  if (!routes.length) {
    throw new Exception('At least one route')
  }

  const combined: KeqRoute = async (ctx) => {
    const results = await Promise.all(routes.map((route) => route(ctx)))
    return results.some((result) => result === true)
  }

  combined.__keqRouteName__ = `or(${routes.map((r) => r.__keqRouteName__ || r.name || 'anonymous').join(', ')})`
  return combined
}
