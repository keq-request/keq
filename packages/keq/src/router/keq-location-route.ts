import { isBrowser } from '../is/is-browser.js'

import type { KeqRoute } from '~/types/keq-route.js'

export function keqLocationRoute(): KeqRoute {
  return (ctx) => isBrowser() && ctx.request.url.host === window.location.host
}
