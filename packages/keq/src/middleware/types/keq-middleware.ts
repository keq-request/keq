import { KeqExecutionContext } from '~/context/execution-context.js'
import type { KeqNext } from './keq-next.js'


export interface KeqMiddleware {
  (ctx: KeqExecutionContext, next: KeqNext): Promise<void>
  __keqMiddlewareName__?: string
}
