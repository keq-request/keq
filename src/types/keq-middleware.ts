import type { KeqContext } from './keq-context.js'
import type { KeqNext } from './keq-next.js'


export type KeqMiddleware = (ctx: KeqContext, next: KeqNext) => Promise<void>
