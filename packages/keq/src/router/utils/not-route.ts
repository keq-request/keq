import type { KeqRoute } from '~/router/types/keq-route.js'


export function notRoute(route: KeqRoute): KeqRoute {
  const negated: KeqRoute = async (ctx) => !(await route(ctx))
  negated.__keqRouteName__ = `not(${route.__keqRouteName__ || route.name || 'anonymous'})`
  return negated
}
