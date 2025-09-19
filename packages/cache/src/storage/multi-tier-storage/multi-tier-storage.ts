import { CacheEntry } from '~/cache-entry/cache-entry.js'
import { KeqCacheStorage } from '../keq-cache-storage.js'
import { MultiTierStorageOptions } from './types/multi-tier-storage-options.js'

/**
 * @en Multi-tier cache storage that manages multiple KeqCacheStorage instances in tiers
 * @zh 多层缓存存储，管理多个分层的 KeqCacheStorage 实例
 */
export class MultiTierStorage extends KeqCacheStorage {
  private readonly storages: KeqCacheStorage[]

  /**
   * @param storages Array of storage instances ordered by performance (fastest first)
   * @zh 按性价比排序的存储实例数组，排在前面的成本低，排在后面的成本高
   */
  constructor(options: MultiTierStorageOptions) {
    super()

    if (!options.tiers || options.tiers.length === 0) {
      throw new Error('At least one storage instance is required')
    }

    this.storages = [...options.tiers]
  }

  /**
   * @en Get cache entry, searching from lowest to highest tier
   * @zh 获取缓存条目，从最底层到高层依次搜索
   */
  async get(key: string): Promise<CacheEntry | undefined> {
    for (let i = 0; i < this.storages.length; i++) {
      const storage = this.storages[i]
      const entry = await storage.get(key)

      if (entry) {
        // 缓存命中，如果不是在最底层，则需要同步到所有低层存储
        if (i > 0) {
          await this.syncToLowerTiers(entry, i)
        }
        return entry
      }
    }

    // 所有层都未命中
    return undefined
  }

  /**
   * @en Set cache entry to all tiers concurrently
   * @zh 并发写入所有层的缓存
   */
  async set(entry: CacheEntry): Promise<void> {
    // 并发写入所有存储层
    const promises = this.storages.map((storage) => storage.set(entry))
    await Promise.all(promises)
  }

  /**
   * @en Remove cache entry from all tiers
   * @zh 从所有层删除缓存条目
   */
  async remove(key: string): Promise<void> {
    // 并发删除所有存储层
    const promises = this.storages.map((storage) => storage.remove(key))
    await Promise.all(promises)
  }

  /**
   * @en Sync cache entry to all lower tiers (tiers with index < currentTierIndex)
   * @zh 将缓存条目同步到所有低层存储（索引小于当前层的存储）
   */
  private async syncToLowerTiers(entry: CacheEntry, currentTierIndex: number): Promise<void> {
    // 只同步到低层（索引更小的层），不向高层同步
    const lowerTierStorages = this.storages.slice(0, currentTierIndex)

    if (lowerTierStorages.length === 0) {
      return
    }

    // 并发写入所有低层存储
    // 使用克隆避免并发修改问题
    const promises = lowerTierStorages.map((storage) => storage.set(entry.clone()))

    // 同步写入失败不应该影响主要的get操作，所以我们捕获错误但不抛出
    try {
      await Promise.all(promises)
    } catch (error) {
      // 可以在这里添加日志记录，但不抛出错误
      console.warn('Failed to sync cache entry to lower tiers:', error)
    }
  }
}
