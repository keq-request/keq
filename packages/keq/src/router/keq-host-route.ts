import type { KeqRoute } from '~/types/keq-route.js'


export function keqHostRoute(host: string): KeqRoute {
  return (ctx) => ctx.request.url.host === host
}
