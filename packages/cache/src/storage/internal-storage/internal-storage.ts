import { InternalStorageOptions } from '~/storage/internal-storage/types/storage-options.js'
import { debug } from '~/utils/debug.js'
import { KeqCacheStorage } from '../keq-cache-storage.js'
import { OnCacheEvictEvent, OnCacheExpiredEvent, OnCacheGetEvent, OnCacheRemoveEvent, OnCacheSetEvent } from './types/events.js'


export abstract class InternalStorage extends KeqCacheStorage {
  protected readonly __id__: string = Math.random()
    .toString(36)
    .slice(2)

  protected readonly __size__: number
  protected readonly __debug__: boolean

  protected readonly __onCacheGet__?: (event: OnCacheGetEvent) => void
  protected readonly __onCacheSet__?: (event: OnCacheSetEvent) => void
  protected readonly __onCacheRemove__?: (event: OnCacheRemoveEvent) => void
  protected readonly __onCacheEvict__?: (event: OnCacheEvictEvent) => void
  protected readonly __onCacheExpired__?: (event: OnCacheExpiredEvent) => void

  constructor(options?: InternalStorageOptions) {
    super()

    if (options?.size && (typeof options?.size !== 'number' || options.size <= 0)) {
      throw TypeError(`Invalid size: ${String(options?.size)}`)
    }

    this.__size__ = options?.size ?? Infinity
    this.__debug__ = !!options?.debug

    this.__onCacheGet__ = options?.onCacheGet
    this.__onCacheSet__ = options?.onCacheSet
    this.__onCacheRemove__ = options?.onCacheRemove
    this.__onCacheEvict__ = options?.onCacheEvict

    this.debug((log) => log('Storage Created: ', this))
  }

  protected debug(fn: (log: (...args: unknown[]) => void) => void): void {
    if (this.__debug__) {
      fn((...args: unknown[]) => {
        debug(`[Storage(${this.__id__})]`, ...args)
      })
    }
  }
}
