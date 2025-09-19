export * from './cache.js'
export * from './constants/strategy.enum.js'
export * from './constants/eviction.enum.js'

export {
  KeqCacheStorage as CacheStorage,
  IndexedDBStorage,
  MemoryStorage,
  TierStorage,
} from '~/storage/index.js'


export { KeqCacheOption } from '~/types/keq-cache-option.js'
export { KeqCacheStrategy } from '~/types/keq-cache-strategy.js'
export { KeqCacheParameters } from '~/types/keq-cache-parameters.js'
export { KeqCacheRule } from '~/types/keq-cache-rule.js'
export { StrategyOptions } from '~/types/strategies-options.js'
