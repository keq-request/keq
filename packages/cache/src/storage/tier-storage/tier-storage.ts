import { MemoryStorage } from '../memory-storage/memory-storage.js'
import { IndexedDBStorage } from '../indexed-db-storage/indexed-db-storage.js'
import { MultiTierStorage } from '../multi-tier-storage/multi-tier-storage.js'
import { TierStorageOptions } from './types/tier-storage-options.js'

/**
 * @en Two-tier cache storage that combines MemoryStorage (L1) and IndexedDBStorage (L2)
 * @zh 二级缓存存储，结合了MemoryStorage（一级）和IndexedDBStorage（二级）
 *
 * This is a convenience wrapper around MultiTierStorage that provides:
 * - Fast in-memory cache (L1)
 * - Persistent IndexedDB cache (L2)
 * - Simplified configuration options
 */
export class TierStorage extends MultiTierStorage {
  constructor(options?: TierStorageOptions) {
    // Handle memory storage: use existing instance or create new one
    const memoryStorage = options?.memory instanceof MemoryStorage
      ? options.memory
      : new MemoryStorage(options?.memory)

    // Handle IndexedDB storage: use existing instance or create new one
    const indexedDBStorage = options?.indexedDB instanceof IndexedDBStorage
      ? options.indexedDB
      : new IndexedDBStorage(options?.indexedDB)

    super({
      tiers: [memoryStorage, indexedDBStorage],
    })
  }
}
