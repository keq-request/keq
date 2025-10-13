import { Eviction } from '~/constants/eviction.enum.js'
import { InternalStorageOptions } from '~/storage/internal-storage/types/storage-options.js'

export interface MemoryStorageOptions extends InternalStorageOptions {
  /**
   * @default Eviction.LRU
   */
  eviction?: Eviction
}
