import { Validator } from '../validator/index.js'

import type { KeqRoute } from '~/router/types/keq-route.js'

export function keqLocationRoute(): KeqRoute {
  return (ctx) => Validator.isBrowser() && ctx.request.url.host === window.location.host
}
