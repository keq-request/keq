import type { KeqContext } from './keq-context.js'

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type KeqRetryOn = (attempt: number, error: unknown | null, ctx: KeqContext) => (boolean | Promise<boolean>)
export type KeqRetryDelay = number | ((attempt: number, error: unknown | null, ctx: KeqContext) => number | Promise<number>)
