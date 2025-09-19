import { Promisable } from 'type-fest'
import { Eviction } from '~/constants/eviction.enum.js'
import { InternalStorage } from '../internal-storage/internal-storage.js'
import { RandomIndexedDBStorage } from './random-indexed-db-storage.js'
import { LFUIndexedDBStorage } from './lfu-indexed-db-storage.js'
import { LRUIndexedDBStorage } from './lru-indexed-db-storage.js'
import { TTLIndexedDBStorage } from './ttl-indexed-db-storage.js'
import { IndexedDbStorageOptions } from './types/indexed-db-storage-options.js'
import { CacheEntry } from '~/cache-entry/cache-entry.js'
import { KeqCacheStorage } from '../keq-cache-storage.js'


export class IndexedDBStorage extends KeqCacheStorage {
  private storage: InternalStorage

  constructor(options?: IndexedDbStorageOptions) {
    super()

    const eviction = options?.eviction || Eviction.LRU

    if (eviction === Eviction.RANDOM) {
      this.storage = new RandomIndexedDBStorage(options)
    } else if (eviction === Eviction.LFU) {
      this.storage = new LFUIndexedDBStorage(options)
    } else if (eviction === Eviction.LRU) {
      this.storage = new LRUIndexedDBStorage(options)
    } else if (eviction === Eviction.TTL) {
      this.storage = new TTLIndexedDBStorage(options)
    } else {
      throw TypeError(`Not Supported Eviction: ${String(options?.eviction)}`)
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
