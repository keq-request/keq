import * as m from 'minimatch'

import type { KeqRoute } from '~/router/types/keq-route.js'

export function keqPathnameRoute(pathname: string): KeqRoute {
  return (ctx) => {
    // TODO: minimatch will cause each request to consume an additional 1-2ms.
    return m.minimatch(ctx.request.url.pathname, pathname)
  }
}
