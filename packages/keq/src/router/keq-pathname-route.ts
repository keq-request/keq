import picomatch from 'picomatch'

import type { KeqRoute } from '~/router/types/keq-route.js'

export function keqPathnameRoute(pathname: string): KeqRoute {
  const isMatch = picomatch(pathname)
  return (ctx) => {
    return isMatch(ctx.request.url.pathname)
  }
}
