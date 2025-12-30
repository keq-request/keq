import * as R from 'ramda'
import { KeqContext } from 'keq'
import { CacheException } from '~/exceptions'
import { KeqCacheStorage } from '~/storage'
import { CacheEntry } from '~/cache-entry'
import { RequestCacheOptions } from '../types/index.js'


export type RequestCacheHandlerOptions = Omit<RequestCacheOptions, 'strategy'>

export class RequestCacheHandler {
  constructor(
    public readonly storage: KeqCacheStorage,
    public readonly options: Readonly<RequestCacheHandlerOptions>,
  ) {}

  /**
   * Get cache key for request
   */
  getRequestCacheKey(context: KeqContext): string {
    const options = this.options

    if (typeof options.key === 'string') return options.key
    else if (typeof options.key === 'function') return options.key(context)
    else if (R.isNil(options.key) && context.locationId) return context.locationId
    else throw new CacheException('Cannot resolve cache key')
  }

  /**
   * Get cache from storage
   */
  async getCache(context: KeqContext): Promise<[string, CacheEntry | undefined]> {
    const key = this.getRequestCacheKey(context)

    if (this.options.serverTiming) {
      const startAt = new Date()
      const entry = await this.storage.get(key)
      if (entry) {
        const dur = new Date().getTime() - startAt.getTime()
        entry.response.headers.append('Server-Timing', `keq-cache; dur=${dur}; desc="HIT"`)
      }

      return [key, entry]
    }

    return [key, await this.storage.get(key)]
  }

  /**
   * Store response that in context to storage
   */
  async setCache(context: KeqContext): Promise<[string, CacheEntry | undefined]> {
    const options = this.options
    const key = this.getRequestCacheKey(context)

    if (!context.response) return [key, undefined]
    if (options.exclude && (await options.exclude(context.response))) return [key, undefined]

    const entry = await CacheEntry.build({
      key,
      response: context.response,
      ttl: options.ttl,
    })

    void this.storage.set(entry)

    return [key, entry]
  }
}
