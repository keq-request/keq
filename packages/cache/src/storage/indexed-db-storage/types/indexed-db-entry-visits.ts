export interface IndexedDBEntryVisits {
  key: string

  /**
   * @en the number of times the cache entry has been used
   * @zh 缓存条目被使用的次数
   */
  visitCount: number

  /**
   * @en the last time the cache entry was used
   * @zh 缓存条目最后一次使用的时间
   */
  lastVisitedAt: Date
}
