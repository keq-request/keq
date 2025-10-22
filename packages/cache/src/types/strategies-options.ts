import { KeqCacheStorage } from '~/storage/keq-cache-storage.js'


export interface StrategyOptions {
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
