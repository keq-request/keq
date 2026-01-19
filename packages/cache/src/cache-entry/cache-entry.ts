import { createProxyResponse } from 'keq'
import { getResponseBytes } from '~/utils/get-response-bytes.js'
import { CacheEntryOptions } from './types/cache-entry-options.js'
import { CacheEntryBuildOptions } from './types/cache-entry-build-options.js'
import { MAX_EXPIRED_AT } from '~/constants/index.js'


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
    this.response = createProxyResponse(options.response)
    this.size = options.size
    this.expiredAt = options.expiredAt ?? MAX_EXPIRED_AT
  }

  static async build(options: CacheEntryBuildOptions): Promise<CacheEntry> {
    const expiredAt = 'expiredAt' in options
      ? options.expiredAt
      : ('ttl' in options && typeof options.ttl === 'number' && options.ttl > 0)
        ? new Date(Date.now() + options.ttl * 1000)
        : MAX_EXPIRED_AT

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

  assignResponseHeaders(headers: Headers): void {
    this.response = new Response(this.response.body, {
      status: this.response.status,
      statusText: this.response.statusText,
      headers: headers,
    })
  }
}
