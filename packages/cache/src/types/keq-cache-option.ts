import { KeqCacheEvents } from './keq-cache-events'
import { KeqCacheStrategy } from './keq-cache-strategy'
import { KeqCacheKey } from './keq-cache-key'


export interface KeqCacheOption extends KeqCacheEvents {
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
