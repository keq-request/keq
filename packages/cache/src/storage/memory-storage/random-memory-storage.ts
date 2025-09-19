import { random } from '~/utils/random.js'
import { BaseMemoryStorage } from './base-memory-storage.js'
import { MemoryStorageOptions } from './types/memory-storage-options.js'


export class RandomMemoryStorage extends BaseMemoryStorage {
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

    while (deficitSize > 0 && entries.length) {
      const index = random(0, entries.length - 1)
      const entry = entries[index]
      deficitSize -= entry.size
      entries.splice(index, 1)
      this.remove(entry.key)
    }

    return true
  }
}
