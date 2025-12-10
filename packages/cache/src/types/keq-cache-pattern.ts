import { KeqContext } from 'keq'


export type KeqCachePattern = RegExp | ((ctx: KeqContext) => boolean) | true
