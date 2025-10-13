import { KeqCacheStorage } from '~/storage/keq-cache-storage.js'

export interface MultiTierStorageOptions {
  tiers: KeqCacheStorage[]
}
