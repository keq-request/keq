import { Eviction } from '~/constants/index.js'
import { InternalStorageOptions } from '~/storage/internal-storage/types/storage-options.js'

export interface MemoryStorageOptions extends InternalStorageOptions {
  /**
   * @default Eviction.LRU
   */
  eviction?: Eviction
}
