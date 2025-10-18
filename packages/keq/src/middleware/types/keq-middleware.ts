import { KeqContext } from '~/context/context.js'
import type { KeqNext } from './keq-next.js'


export interface KeqMiddleware {
  (ctx: KeqContext, next: KeqNext): Promise<void>
  __keqMiddlewareName__?: string
}
