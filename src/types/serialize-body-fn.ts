import { Context } from './context'
import { KeqBody } from './keq-body'


export type SerializeBodyFn = (body: KeqBody, ctx: Context) => any
