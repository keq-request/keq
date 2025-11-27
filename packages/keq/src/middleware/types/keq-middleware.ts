import { KeqExecutionContext } from '~/context/execution-context.js'
import type { KeqNext } from './keq-next.js'
import { Promisable } from 'type-fest'


export interface KeqMiddleware {
  (ctx: KeqExecutionContext, next: KeqNext): Promisable<void>
  __keqMiddlewareName__?: string
}
