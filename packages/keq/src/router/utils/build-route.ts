import { keqHostRoute } from '~/router/keq-host-route.js'
import { keqMethodRoute } from '~/router/keq-method-route.js'
import { keqPathnameRoute } from '~/router/keq-pathname-route.js'
import { composeRoute } from './compose-route.js'

import type { KeqRoute } from '~/router/types/keq-route.js'
import type { KeqRoutePattern } from '~/router/types/keq-route-pattern.js'


export function buildRoute(pattern: KeqRoutePattern): KeqRoute {
  const routes: KeqRoute[] = []

  if (pattern.host) routes.push(keqHostRoute(pattern.host))
  if (pattern.method) routes.push(keqMethodRoute(pattern.method))
  if (pattern.pathname) routes.push(keqPathnameRoute(pattern.pathname))

  if (routes.length === 0) {
    const always: KeqRoute = () => true
    always.__keqRouteName__ = 'always'
    return always
  }

  if (routes.length === 1) return routes[0]
  return composeRoute(routes)
}
