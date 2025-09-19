import dayjs from 'dayjs'
import * as R from 'ramda'
import { InternalStorage } from '../internal-storage/internal-storage.js'
import { CacheEntry } from '~/cache-entry/cache-entry.js'
import { MemoryStorageSize } from './types/memory-storage-size.js'


export abstract class BaseMemoryStorage extends InternalStorage {
  protected storage = new Map<string, CacheEntry>()

  protected visitTimeRecords = new Map<string, Date>()
  protected visitCountRecords = new Map<string, number>()

  protected get size(): MemoryStorageSize {
    const used = R.sum(R.pluck('size', [...this.storage.values()]))
    const free = this.__size__ > used ? this.__size__ - used : 0

    return {
      used,
      free,
    }
  }

  get(key: string): CacheEntry | undefined {
    this.evictExpired()
    const entry = this.storage.get(key)

    this.visitCountRecords.set(key, (this.visitCountRecords.get(key) ?? 0) + 1)
    this.visitTimeRecords.set(key, new Date())

    if (!entry) this.debug((log) => log(`Entry(${key}) Not Found`))
    else this.debug((log) => log(`Entry(${key}) Found: `, entry))

    return entry?.clone()
  }

  set(value: CacheEntry): void {
    if (!this.evict(value.size)) {
      this.debug((log) => log('Storage Size Not Enough: ', this.size.free, ' < ', value.size))
      return
    }

    this.storage.set(value.key, value)
    this.visitTimeRecords.set(value.key, new Date())
    this.visitCountRecords.set(value.key, (this.visitCountRecords.get(value.key) ?? 0))

    this.debug((log) => log('Entry Added: ', value))
    this.debug((log) => log('Storage Size: ', this.size))
  }

  remove(key: string): void {
    const entry = this.storage.get(key)
    if (!entry) return

    this.storage.delete(key)
    this.visitCountRecords.delete(key)
    this.visitTimeRecords.delete(key)

    this.debug((log) => log('Entry Removed: ', entry))
    this.debug((log) => log('Storage Size: ', this.size))
  }

  private lastEvictExpiredTime = dayjs()

  /**
   * @zh 清除过期的缓存
   */
  protected evictExpired(): void {
    const now = dayjs()

    if (now.diff(this.lastEvictExpiredTime, 'second') < 1) return

    for (const [key, entry] of this.storage.entries()) {
      if (entry.expiredAt && now.isAfter(entry.expiredAt)) {
        this.remove(key)
      }
    }
  }

  /**
   * @en Evict the storage to make sure the size is enough
   * @zh 清除缓存以确保有足够的空间
   *
   * @return {boolean} - is evicted successfully
   */
  protected evict(expectSize: number): boolean {
    this.evictExpired()
    const size = this.size

    return size.free >= expectSize
  }
}

