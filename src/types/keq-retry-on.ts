import { KeqContext } from './keq-context'

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type KeqRetryOn = (attempt: number, error: unknown | null, ctx: KeqContext) => (boolean | Promise<boolean>)
