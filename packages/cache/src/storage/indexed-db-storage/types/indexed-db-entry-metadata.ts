

export interface IndexedDBEntryMetadata {
  key: string

  /**
   * @en bytes
   * @zh 字节数
   */
  size: number

  expiredAt: Date
  visitedAt: Date
  visitCount: number
}

