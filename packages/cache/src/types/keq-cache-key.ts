import { KeqContext } from 'keq'


export type KeqCacheKey = string | ((context: KeqContext) => string)
