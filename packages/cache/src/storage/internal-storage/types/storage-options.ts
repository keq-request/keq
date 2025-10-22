import { OnCacheEvictEvent, OnCacheExpiredEvent, OnCacheGetEvent, OnCacheRemoveEvent, OnCacheSetEvent } from "./events"

export interface InternalStorageOptions {
  /**
   * @default false
   */
  debug?: boolean

  /**
   * @en bytes
   * @zh 字节数
   *
   * @default Infinity
   */
  size?: number

  onCacheGet?: (event: OnCacheGetEvent) => void
  onCacheSet?: (event: OnCacheSetEvent) => void
  onCacheRemove?: (event: OnCacheRemoveEvent) => void
  onCacheEvict?: (event: OnCacheEvictEvent) => void
  onCacheExpired?: (event: OnCacheExpiredEvent) => void
}

