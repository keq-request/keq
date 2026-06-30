import type { CacheStore, CacheSetOptions } from './types/index.js'

export class NamespacedCacheStore implements CacheStore {
  constructor(
    private inner: CacheStore,
    private namespace: string,
  ) {}

  private prefixKey(key: string): string {
    return `${this.namespace}:${key}`
  }

  async get<T = unknown>(key: string): Promise<T | undefined> {
    return this.inner.get<T>(this.prefixKey(key))
  }

  async set<T = unknown>(key: string, value: T, options?: CacheSetOptions): Promise<void> {
    return this.inner.set(this.prefixKey(key), value, options)
  }

  async has(key: string): Promise<boolean> {
    return this.inner.has(this.prefixKey(key))
  }

  async delete(key: string): Promise<void> {
    return this.inner.delete(this.prefixKey(key))
  }

  async clear(): Promise<void> {
    return this.inner.clear()
  }
}
