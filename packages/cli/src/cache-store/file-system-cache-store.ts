import path from 'path'
import fs from 'fs-extra'
import { createHash } from 'crypto'
import type { CacheStore, CacheSetOptions } from './types/index.js'

interface StoredEntry<T = unknown> {
  value: T
  expiresAt: number | null
  createdAt: number
}

export class FileSystemCacheStore implements CacheStore {
  private cacheDir: string
  /** Fallback TTL to prevent cache files from accumulating indefinitely when callers omit ttl */
  private readonly maxTtl = 7 * 24 * 60 * 60 * 1000

  constructor(cacheDir: string) {
    this.cacheDir = cacheDir
  }

  async get<T = unknown>(key: string): Promise<T | undefined> {
    const filepath = this.keyToPath(key)
    try {
      const raw = await fs.readFile(filepath, 'utf-8')
      const entry: StoredEntry<T> = JSON.parse(raw)

      if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
        await fs.remove(filepath).catch(() => {})
        return undefined
      }

      return entry.value
    } catch {
      return undefined
    }
  }

  async set<T = unknown>(key: string, value: T, options?: CacheSetOptions): Promise<void> {
    const filepath = this.keyToPath(key)
    await fs.ensureDir(path.dirname(filepath))

    const effectiveTtl = options?.ttl ? Math.min(options.ttl, this.maxTtl) : this.maxTtl

    const entry: StoredEntry<T> = {
      value,
      expiresAt: Date.now() + effectiveTtl,
      createdAt: Date.now(),
    }

    await fs.writeFile(filepath, JSON.stringify(entry), 'utf-8')
  }

  async has(key: string): Promise<boolean> {
    const result = await this.get(key)
    return result !== undefined
  }

  async delete(key: string): Promise<void> {
    const filepath = this.keyToPath(key)
    await fs.remove(filepath).catch(() => {})
  }

  async clear(): Promise<void> {
    await fs.remove(this.cacheDir).catch(() => {})
  }

  private keyToPath(key: string): string {
    const hash = createHash('sha256').update(key)
      .digest('hex')
    return path.join(this.cacheDir, `${hash}.json`)
  }
}
