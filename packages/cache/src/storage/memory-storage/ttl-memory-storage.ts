import dayjs from 'dayjs'
import * as R from 'ramda'
import { BaseMemoryStorage } from './base-memory-storage.js'
import { MemoryStorageOptions } from './types/memory-storage-options.js'


export class TTLMemoryStorage extends BaseMemoryStorage {
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
        const aExpiredAt = dayjs(a.expiredAt)
        const bExpiredAt = dayjs(b.expiredAt)

        return aExpiredAt.isBefore(bExpiredAt) ? 1 : -1
      })

    if (R.sum(R.pluck('size', entries)) < deficitSize) {
      this.debug((log) => log('Storage Size Not Enough: ', this.size.free, ' < ', deficitSize))
      return false
    }

    while (deficitSize > 0 && entries.length) {
      const entry = entries.pop()!
      deficitSize -= entry.size
      this.remove(entry.key)
    }

    return true
  }
}
