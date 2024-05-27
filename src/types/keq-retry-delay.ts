import type { KeqContext } from './keq-context'


export type KeqRetryDelay = number | ((attempt: number, error: unknown | null, ctx: KeqContext) => number | Promise<number>)
