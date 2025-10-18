import * as m from 'minimatch'

import type { KeqRoute } from '~/router/types/keq-route.js'

export function keqPathnameRoute(pathname: string): KeqRoute {
  return (ctx) => m.minimatch(ctx.request.url.pathname, pathname)
}
