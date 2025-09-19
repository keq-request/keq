import { Promisable } from 'type-fest'
import { CacheEntry } from '~/cache-entry/cache-entry'


export abstract class KeqCacheStorage {
  /**
   * @en Get the length of the storage
   * @zh 获取 Storage 缓存的条目数量
   */
  abstract get(key: string): Promisable<CacheEntry | undefined>

  /**
   * @en Set a new entry to the storage
   * @zh 将被缓存的数据添加到Storage中
   */
  abstract set(entry: CacheEntry): Promisable<void>

  /**
   * @en Remove an entry by key
   * @zh 根据key删除Storage中的数据
   */
  abstract remove(key: string): Promisable<void>
}
