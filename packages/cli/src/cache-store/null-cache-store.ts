/* eslint-disable @typescript-eslint/require-await */
import type { CacheStore, CacheSetOptions } from './types/index.js'

export class NullCacheStore implements CacheStore {
  async get<T = unknown>(): Promise<T | undefined> {
    return undefined
  }

  async set<T = unknown>(_key: string, _value: T, _options?: CacheSetOptions): Promise<void> {}

  async has(): Promise<boolean> {
    return false
  }

  async delete(): Promise<void> {}

  async clear(): Promise<void> {}
}
