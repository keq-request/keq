import * as R from 'ramda'
import { random } from '~/utils/random.js'
import { BaseIndexedDBStorage } from './base-indexed-db-storage.js'
import { IndexedDbStorageOptions } from './types/indexed-db-storage-options.js'


export class RandomIndexedDBStorage extends BaseIndexedDBStorage {
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

    const metadatas = await metadataStore.getAll()
    const totalSize = R.sum(metadatas.map((m) => m.size))

    if (totalSize < deficitSize) {
      this.debug((log) => log(`Storage Size Not Enough, deficit size: ${deficitSize - totalSize}`))
      await tx.abort()
      return false
    }

    const keys: string[] = []
    while (deficitSize > 0 && metadatas.length) {
      const index = random(0, metadatas.length - 1)

      const metadata = metadatas[index]
      deficitSize -= metadata.size
      keys.push(metadata.key)
      metadatas.splice(index, 1)
    }

    await this.__remove__(tx, keys)

    await tx.done
    return true
  }
}
