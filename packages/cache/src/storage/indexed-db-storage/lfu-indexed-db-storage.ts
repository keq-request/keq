import { BaseIndexedDBStorage } from './base-indexed-db-storage.js'
import { IndexedDbStorageOptions } from './types/indexed-db-storage-options.js'


export class LFUIndexedDBStorage extends BaseIndexedDBStorage {
  constructor(options?: IndexedDbStorageOptions) {
    super(options)
  }

  async evict(expectSize: number): Promise<boolean> {
    await this.evictExpired()

    const size = await this.getSize()

    let deficitSize = expectSize - size.free
    if (deficitSize <= 0) return true

    const db = await this.openDB()
    const tx = db.transaction(['metadata', 'response', 'visits'], 'readwrite')

    const metadataStore = tx.objectStore('metadata')
    const visitsStore = tx.objectStore('visits')

    let cursor = await visitsStore
      .index('visitCount')
      .openCursor()

    const keys: string[] = []
    while (deficitSize > 0 && cursor) {
      const metadata = await metadataStore.get(cursor.value.key)

      if (!metadata) {
        await cursor.delete()
        cursor = await cursor.continue()
        continue
      }

      deficitSize -= metadata.size
      keys.push(cursor.value.key)
      cursor = await cursor.continue()
    }

    if (deficitSize > 0) {
      this.debug((log) => log(`Storage Size Not Enough, deficit size: ${deficitSize}`))
      await tx.abort
      return false
    }

    await this.__remove__(tx, keys)
    await tx.done
    return true
  }
}
