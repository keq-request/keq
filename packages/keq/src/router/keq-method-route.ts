import type { KeqRoute } from '~/router/types/keq-route.js'


export function keqMethodRoute(method): KeqRoute {
  return (ctx) => ctx.request.method.toLowerCase() === method.toLowerCase()
}
