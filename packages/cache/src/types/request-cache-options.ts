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
   * This configuration item controls whether requests are allowed to be concurrent.
   * By default, concurrency is disabled
   *
   * When multiple requests with the same key occur,
   * the subsequent ones are blocked until the previous request completes.
   * This ensures that the cache is utilized effectively and prevents redundant processing for identical keys
   *
   * @default false
   */
  concurrent?: boolean


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
