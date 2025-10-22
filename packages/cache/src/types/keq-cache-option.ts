import { KeqCacheStrategy } from './keq-cache-strategy.js'
import { KeqCacheKey } from './keq-cache-key.js'


export interface KeqCacheOption {
  /**
   * Cache Key
   */
  key?: KeqCacheKey

  /**
   * @default Strategy.NETWORK_FIRST
   */
  strategy: KeqCacheStrategy

  /**
   * @en seconds
   * @zh 秒
   *
   * @default Infinity
   */
  ttl?: number

  /**
   * If exclude is true, the request will not be cached.
   */
  exclude?: (res: Response) => (Promise<boolean> | boolean)
}
