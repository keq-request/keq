import * as R from 'ramda'
import { InternalStorage } from '../internal-storage/internal-storage.js'
import { IDBPDatabase, IDBPTransaction, openDB } from 'idb'
import dayjs from 'dayjs'
import { IndexedDBSchema } from '~/storage/indexed-db-storage/types/indexed-db-schema.js'
import { IndexedDBEntryResponse } from '~/storage/indexed-db-storage/types/indexed-db-entry-response.js'
import { IndexedDBEntryMetadata } from '~/storage/indexed-db-storage/types/indexed-db-entry-metadata.js'
import { DEFAULT_TABLE_NAME } from './constants/default-table-name.js'
import { CacheEntry } from '~/cache-entry/index.js'
import { IndexedDBStorageSize } from './types/indexed-db-storage-size.js'
import { IndexedDbStorageOptions } from './types/indexed-db-storage-options.js'


export abstract class BaseIndexedDBStorage extends InternalStorage {
  private readonly tableName: string = DEFAULT_TABLE_NAME
  private db?: IDBPDatabase<IndexedDBSchema>

  constructor(options?: IndexedDbStorageOptions) {
    super(options)
    if (options?.tableName === DEFAULT_TABLE_NAME) {
      throw new TypeError(`[keq-cache] IndexedDBStorage name cannot be "${DEFAULT_TABLE_NAME}"`)
    }

    this.tableName = options?.tableName || DEFAULT_TABLE_NAME
  }

  protected async openDB(): Promise<IDBPDatabase<IndexedDBSchema>> {
    if (this.db) return this.db
    const tableName = this.tableName

    const db = await openDB<IndexedDBSchema>(tableName, 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('metadata')) {
          const entriesStore = db.createObjectStore('metadata', { keyPath: 'key' })

          entriesStore.createIndex('expiredAt', 'expiredAt')
        }

        if (!db.objectStoreNames.contains('response')) {
          const responsesStore = db.createObjectStore('response', { keyPath: 'key' })
          responsesStore.createIndex('responseStatus', 'responseStatus')
        }

        if (!db.objectStoreNames.contains('visits')) {
          const visitsStore = db.createObjectStore('visits', { keyPath: 'key' })
          visitsStore.createIndex('visitCount', 'visitCount')
          visitsStore.createIndex('lastVisitedAt', 'lastVisitedAt')
        }
      },

      blocked() {
        console.error(`IndexedDB Table ${tableName} is blocked`)
      },

      blocking() {
        console.error(`IndexedDB Table ${tableName} is blocking`)
      },

      terminated() {
        console.error(`IndexedDB Table ${tableName} is terminated`)
      },
    })

    this.db = db
    return db
  }

  protected async getSize(): Promise<IndexedDBStorageSize> {
    const db = await this.openDB()
    const items = await db.getAll('metadata')
    const used = R.sum(items.map((entry) => entry.size))
    const free = this.__size__ - used
    return { used, free }
  }


  async get(key: string): Promise<CacheEntry | undefined> {
    await this.evictExpired()

    try {
      const db = await this.openDB()
      const dbMetadata = await db.get('metadata', key)
      const dbResponse = await db.get('response', key)
      const dbVisits = await db.get('visits', key)

      if (!dbMetadata || !dbResponse) return

      await db.put('visits', {
        key: dbMetadata.key,
        visitCount: dbVisits ? dbVisits.visitCount + 1 : 1,
        lastVisitedAt: new Date(),
      })

      const response = new Response(dbResponse.responseBody, {
        status: dbResponse.responseStatus,
        headers: new Headers(dbResponse.responseHeaders),
        statusText: dbResponse.responseStatusText,
      })

      return await CacheEntry.build({
        key: dbMetadata.key,
        expiredAt: dbMetadata.expiredAt,
        response,
        size: dbMetadata.size,
      })
    } catch (error) {
      return
    }
  }

  async set(entry: CacheEntry): Promise<void> {
    try {
      if (!await this.evict(entry.size)) {
        const size = await this.getSize()
        this.debug((log) => log(`Storage Size Not Enough: ${size.free} < ${entry.size}`))
        return
      }

      const dbMetadata: IndexedDBEntryMetadata = {
        key: entry.key,
        size: entry.size,
        expiredAt: entry.expiredAt,
        visitedAt: new Date(),
        visitCount: 0,
      }

      const response = entry.response.clone()
      const dbResponse: IndexedDBEntryResponse = {
        key: entry.key,
        responseBody: await response.arrayBuffer(),
        responseHeaders: [...response.headers.entries()],
        responseStatus: response.status,
        responseStatusText: response.statusText,
      }

      const db = await this.openDB()
      const tx = db.transaction(['metadata', 'response', 'visits'], 'readwrite')
      const metadataStore = await tx.objectStore('metadata')
      const responseStore = await tx.objectStore('response')
      const visitsStore = await tx.objectStore('visits')

      const dbVisits = (await visitsStore.get(entry.key)) || {
        key: entry.key,
        visitCount: 0,
        lastVisitedAt: new Date(),
      }

      await Promise.all([
        metadataStore.put(dbMetadata),
        responseStore.put(dbResponse),
        visitsStore.put(dbVisits),
      ])

      await tx.done
    } catch (error) {
      return
    }
  }

  protected async __remove__(tx: IDBPTransaction<IndexedDBSchema, ('metadata' | 'response' | 'visits')[], 'readwrite'>, keys: string[]): Promise<void> {
    await Promise.all(
      R.unnest(
        keys.map((key) => [
          tx.objectStore('metadata').delete(key),
          tx.objectStore('response').delete(key),
          tx.objectStore('visits').delete(key),
        ]),
      ),
    )
  }

  async remove(key: string): Promise<void> {
    try {
      const db = await this.openDB()
      const tx = db.transaction(['metadata', 'response', 'visits'], 'readwrite')
      await this.__remove__(tx, [key])
      await tx.done
    } catch (error) {
      return
    }
  }


  private lastEvictExpiredTime = dayjs()

  /**
   * @zh 清除过期的缓存
   */
  protected async evictExpired(): Promise<void> {
    const now = dayjs()
    if (now.diff(this.lastEvictExpiredTime, 'second') < 1) return

    try {
      const now = dayjs()

      const db = await this.openDB()
      const tx = db.transaction(['metadata', 'response', 'visits'], 'readwrite')
      const metadataStore = tx.objectStore('metadata')
      // const responseStore = tx.objectStore('response')
      // const visitsStore = tx.objectStore('visits')

      let cursor = await metadataStore
        .index('expiredAt')
        .openCursor(IDBKeyRange.upperBound(now.valueOf()))

      const expiredKeys: string[] = []
      while (cursor) {
        if (dayjs(cursor.value.expiredAt).isBefore(now)) {
          expiredKeys.push(cursor.value.key)
          cursor = await cursor.continue()
        } else {
          break
        }
      }

      await this.__remove__(tx, expiredKeys)

      // await Promise.all([
      //   ...expiredKeys.map((key) => metadataStore.delete(key)),
      //   ...expiredKeys.map((key) => responseStore.delete(key)),
      //   ...expiredKeys.map((key) => visitsStore.delete(key)),
      // ])

      await tx.done
    } catch (error) {
      return
    }
  }

  protected abstract evict(expectSize: number): Promise<boolean>
}

