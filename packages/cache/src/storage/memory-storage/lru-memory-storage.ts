import dayjs from 'dayjs'
import { BaseMemoryStorage } from './base-memory-storage.js'
import { MemoryStorageOptions } from './types/memory-storage-options.js'


export class LRUMemoryStorage extends BaseMemoryStorage {
  constructor(options?: MemoryStorageOptions) {
    super(options)
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

    while (deficitSize > 0 && entries.length) {
      const entry = entries.pop()!
      deficitSize -= entry.size
      this.remove(entry.key)
    }

    return true
  }
}
