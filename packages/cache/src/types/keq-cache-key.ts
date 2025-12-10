import { KeqContext } from 'keq'

export type KeqCacheKeyFactory = ((context: KeqContext) => string)
export type KeqCacheKey = string | KeqCacheKeyFactory
