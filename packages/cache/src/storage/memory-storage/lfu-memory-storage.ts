import { BaseMemoryStorage } from './base-memory-storage.js'
import { MemoryStorageOptions } from './types/memory-storage-options.js'


export class LFUMemoryStorage extends BaseMemoryStorage {
  constructor(options?: MemoryStorageOptions) {
    super(options)
  }

  // protected free(arr: CacheEntry[], size: number): void {
  //   let freedSize = 0
  //   arr.sort((a, b) => b.visitCount - a.visitCount)

  //   while (freedSize < size && arr.length) {
  //     const item = arr.pop()!
  //     freedSize += item.size
  //     this.remove(item.key)
  //   }
  // }

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
        const aVisitCount = this.visitCountRecords.get(a.key) || 0
        const bVisitCount = this.visitCountRecords.get(b.key) || 0
        return bVisitCount - aVisitCount
      })

    while (deficitSize > 0 && entries.length) {
      const entry = entries.pop()!
      deficitSize -= entry.size
      this.remove(entry.key)
    }

    return true
  }
}
