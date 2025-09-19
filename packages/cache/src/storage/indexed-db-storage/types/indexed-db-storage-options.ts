import { Eviction } from '~/constants/eviction.enum'
import { InternalStorageOptions } from '~/storage/internal-storage/types/storage-options'


export interface IndexedDbStorageOptions extends InternalStorageOptions {
  /**
   * @en The table name for the IndexedDB storage, multiple instances using the same table name will share the cached data.
   * @zh IndexedDB 存储的表名, 多个实例使用同一个表名会共享缓存数据。
   */
  tableName?: string

  /**
   * @default Eviction.LRU
   */
  eviction?: Eviction
}
