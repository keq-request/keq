import type { KeqRoute } from '~/router/types/keq-route.js'


export function keqHostRoute(host: string): KeqRoute {
  return (ctx) => ctx.request.url.host === host
}
