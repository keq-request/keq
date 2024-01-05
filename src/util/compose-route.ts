import { Exception } from '~/exception/exception'
import { KeqRoute } from '~/types/keq-route.js'


export function composeRoute(routes: KeqRoute[]): KeqRoute {
  if (!routes.length) {
    throw new Exception('At least one route')
  }

  return async (ctx) => {
    const results = await Promise.all(routes.map((route) => route(ctx)))
    return results.every((result) => result === true)
  }
}
