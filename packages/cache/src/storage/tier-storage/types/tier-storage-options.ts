import { MemoryStorageOptions } from '~/storage/memory-storage/types/memory-storage-options.js'
import { IndexedDbStorageOptions } from '~/storage/indexed-db-storage/types/indexed-db-storage-options.js'
import { MemoryStorage } from '~/storage/memory-storage/memory-storage.js'
import { IndexedDBStorage } from '~/storage/indexed-db-storage/indexed-db-storage.js'

/**
 * @en Configuration options for TierStorage
 * @zh TierStorage 的配置选项
 */
export interface TierStorageOptions {
  /**
   * @en Memory storage instance or options for the memory storage (L1 cache)
   * @zh 内存存储实例或配置选项（一级缓存）
   */
  memory?: MemoryStorage | MemoryStorageOptions

  /**
   * @en IndexedDB storage instance or options for the IndexedDB storage (L2 cache)
   * @zh IndexedDB 存储实例或配置选项（二级缓存）
   */
  indexedDB?: IndexedDBStorage | IndexedDbStorageOptions
}
