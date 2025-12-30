import { KeqCacheStrategy, KeqCacheKey } from '~/types/index.js'


/**
 * The options for a cacheable request.
 */
export interface RequestCacheOptions {
  /**
   * Enable debug logs
   */
  debug?: boolean

  /**
   * Enable Server-Timing header
   */
  serverTiming?: boolean

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
