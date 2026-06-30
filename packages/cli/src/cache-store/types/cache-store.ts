export interface CacheSetOptions {
  /** Cache expiration time in milliseconds. If not set, the entry never expires by TTL. */
  ttl?: number
}

export interface CacheStore {
  get<T = unknown>(key: string): Promise<T | undefined>
  set<T = unknown>(key: string, value: T, options?: CacheSetOptions): Promise<void>
  has(key: string): Promise<boolean>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}
