import { KeqContext } from 'keq'
import { KeqCacheRule } from './keq-cache-rule.js'
import { KeqCacheStorage } from '~/storage/keq-cache-storage.js'


export interface KeqCacheParameters {
  storage: KeqCacheStorage

  /**
   * Cache Key Factory
   */
  keyFactory?: (context: KeqContext) => string

  rules?: KeqCacheRule[]
}
