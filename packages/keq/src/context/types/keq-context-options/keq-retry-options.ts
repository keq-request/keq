import { KeqSharedContext } from '~/context'


export type KeqRetryOn = (attempt: number, error: unknown | null, ctx: KeqSharedContext) => (boolean | Promise<boolean>)
export type KeqRetryDelay = number | ((attempt: number, error: unknown | null, ctx: KeqSharedContext) => number | Promise<number>)

export interface KeqRetryOptions {
  times: number
  delay?: KeqRetryDelay
  on?: KeqRetryOn
}
