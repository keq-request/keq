import { minimatch } from 'minimatch'
import { KeqRoute } from '~/types/keq-route.js'

export function keqPathnameRoute(pathname: string): KeqRoute {
  return (ctx) => minimatch(ctx.request.url.pathname, pathname)
}
