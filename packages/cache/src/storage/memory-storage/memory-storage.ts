import { Promisable } from 'type-fest'
import { Eviction } from '~/constants/eviction.enum.js'
import { InternalStorage } from '../internal-storage/internal-storage.js'
import { TTLMemoryStorage } from './ttl-memory-storage.js'
import { RandomMemoryStorage } from './random-memory-storage.js'
import { LRUMemoryStorage } from './lru-memory-storage.js'
import { LFUMemoryStorage } from './lfu-memory-storage.js'
import { MemoryStorageOptions } from './types/memory-storage-options.js'
import { CacheEntry } from '~/cache-entry/cache-entry.js'
import { KeqCacheStorage } from '../keq-cache-storage.js'

export class MemoryStorage extends KeqCacheStorage {
  private storage: InternalStorage

  constructor(options?: MemoryStorageOptions) {
    super()

    const eviction = options?.eviction || Eviction.LRU

    if (eviction === Eviction.TTL) {
      this.storage = new TTLMemoryStorage(options)
    } else if (eviction === Eviction.RANDOM) {
      this.storage = new RandomMemoryStorage(options)
    } else if (eviction === Eviction.LRU) {
      this.storage = new LRUMemoryStorage(options)
    } else if (eviction === Eviction.LFU) {
      this.storage = new LFUMemoryStorage(options)
    } else {
      throw new TypeError(`Invalid eviction: ${String(eviction)}`)
    }
  }

  set(entry: CacheEntry): Promisable<void> {
    return this.storage.set(entry)
  }

  get(key: string): Promisable<CacheEntry | undefined> {
    return this.storage.get(key)
  }

  remove(key: string): Promisable<void> {
    return this.storage.remove(key)
  }
}
