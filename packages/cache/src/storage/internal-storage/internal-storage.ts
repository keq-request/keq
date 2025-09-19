import { InternalStorageOptions } from '~/storage/internal-storage/types/storage-options'
import { debug } from '~/utils/debug'
import { KeqCacheStorage } from '../keq-cache-storage'


export abstract class InternalStorage extends KeqCacheStorage {
  protected readonly __id__: string = Math.random()
    .toString(36)
    .slice(2)

  protected readonly __size__: number
  protected readonly __debug__: boolean

  get __options__(): InternalStorageOptions {
    return {
      size: this.__size__,
      debug: this.__debug__,
    }
  }

  constructor(options?: InternalStorageOptions) {
    super()

    if (options?.size && (typeof options?.size !== 'number' || options.size <= 0)) {
      throw TypeError(`Invalid size: ${String(options?.size)}`)
    }
    this.__size__ = options?.size ?? Infinity
    this.__debug__ = !!options?.debug

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
