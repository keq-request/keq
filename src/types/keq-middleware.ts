import { KeqContext } from './keq-context'
import { KeqNext } from './keq-next'


export type KeqMiddleware = (ctx: KeqContext, next: KeqNext) => Promise<void>
