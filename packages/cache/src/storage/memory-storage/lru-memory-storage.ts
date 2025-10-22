import dayjs from 'dayjs'
import { BaseMemoryStorage } from './base-memory-storage.js'
import { MemoryStorageOptions } from './types/memory-storage-options.js'
import { CacheEntry } from '~/cache-entry/cache-entry.js'


export class LRUMemoryStorage extends BaseMemoryStorage {
  constructor(options?: MemoryStorageOptions) {
    super(options)
  }

  get(key: string): CacheEntry | undefined {
    const entry = super.get(key)
    this.__onCacheGet__?.({ key })
    return entry
  }

  set(value: CacheEntry): void {
    super.set(value)
    this.__onCacheSet__?.({ key: value.key })
  }

  remove(key: string): void {
    super.remove(key)
    this.__onCacheRemove__?.({ key })
  }

  protected evict(expectSize: number): boolean {
    if (expectSize > this.__size__) {
      this.debug((log) => log('Storage Size Not Enough: ', this.__size__, ' < ', expectSize))
      return false
    }
    this.evictExpired()

    let deficitSize = expectSize - this.size.free
    if (deficitSize <= 0) return true

    const entries = [...this.storage.values()]
      .sort((a, b) => {
        const aVisitAt = this.visitTimeRecords.get(a.key)
        const bVisitAt = this.visitTimeRecords.get(b.key)

        if (aVisitAt === bVisitAt) return 0
        if (!aVisitAt) return 1
        if (!bVisitAt) return -1

        return dayjs(aVisitAt).isBefore(dayjs(bVisitAt)) ? 1 : -1
      })

    const keys: string[] = []
    while (deficitSize > 0 && entries.length) {
      const entry = entries.pop()!
      deficitSize -= entry.size
      keys.push(entry.key)
    }

    this.__remove__(keys)
    this.__onCacheEvict__?.({ keys })

    return true
  }
}
