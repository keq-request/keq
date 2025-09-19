import { KeqCacheStorage } from '~/storage/keq-cache-storage'
import { KeqCacheEvents } from './keq-cache-events'


export interface StrategyOptions extends KeqCacheEvents {
  key: string

  /**
   * @en seconds
   * @zh 秒
   *
   * @default Infinity
   */
  ttl?: number

  storage: KeqCacheStorage

  exclude?: (res: Response) => (boolean | Promise<boolean>)
}
