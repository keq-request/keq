import { getResponseBytes } from '~/utils/get-response-bytes.js'
import { CacheEntryOptions } from './types/cache-entry-options.js'
import { CacheEntryBuildOptions } from './types/cache-entry-build-options.js'


export class CacheEntry {
  key: string
  response: Response

  /**
   * @en bytes
   * @zh 字节数
   */
  size: number

  expiredAt: Date

  constructor(options: CacheEntryOptions) {
    this.key = options.key
    this.response = options.response
    this.size = options.size
    this.expiredAt = options.expiredAt ?? new Date(8640000000000000)
  }

  static async build(options: CacheEntryBuildOptions): Promise<CacheEntry> {
    const expiredAt = 'expiredAt' in options
      ? options.expiredAt
      : ('ttl' in options && typeof options.ttl === 'number' && options.ttl > 0)
        ? new Date(Date.now() + options.ttl! * 1000)
        : new Date(8640000000000000)

    const response = options.response.clone()
    return new CacheEntry({
      key: options.key,
      response,
      size: options.size ?? (await getResponseBytes(response)),
      expiredAt: expiredAt,
    })
  }

  clone(): CacheEntry {
    return new CacheEntry({
      key: this.key,
      response: this.response.clone(),
      size: this.size,
      expiredAt: this.expiredAt,
    })
  }


  assign(another: CacheEntry): CacheEntry {
    this.key = another.key
    this.response = another.response.clone()
    this.size = another.size
    this.expiredAt = another.expiredAt
    return this
  }
}
