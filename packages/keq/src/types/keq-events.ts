import type { KeqContext } from './keq-context.js'

export interface KeqEvents {
  fetch: KeqContext
  retry: KeqContext
}

export type KeqListeners = {
  [K in keyof KeqEvents]?: ((data: KeqEvents[K]) => void)[]
}
