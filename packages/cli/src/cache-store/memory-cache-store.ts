/* eslint-disable @typescript-eslint/require-await */
import type { CacheStore, CacheSetOptions } from './types/index.js'

interface MemoryEntry<T = unknown> {
  value: T
  expiresAt: number | null
}

export class MemoryCacheStore implements CacheStore {
  private store = new Map<string, MemoryEntry>()

  async get<T = unknown>(key: string): Promise<T | undefined> {
    const entry = this.store.get(key)
    if (!entry) return undefined

    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return undefined
    }

    return entry.value as T
  }

  async set<T = unknown>(key: string, value: T, options?: CacheSetOptions): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: options?.ttl ? Date.now() + options.ttl : null,
    })
  }

  async has(key: string): Promise<boolean> {
    const result = await this.get(key)
    return result !== undefined
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
  }

  async clear(): Promise<void> {
    this.store.clear()
  }
}
