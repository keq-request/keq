import { KeqContext } from './keq-context.js'


export type KeqRoute = (ctx: KeqContext) => Promise<boolean> | boolean
