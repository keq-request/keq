import { KeqContext } from './keq-context'

export type KeqRetryOn = (attempt: number, error: unknown | null, ctx: KeqContext) => boolean
