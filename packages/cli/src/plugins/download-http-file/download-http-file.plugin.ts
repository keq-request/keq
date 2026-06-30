import { Compiler } from '~/compiler/index.js'
import { Plugin, Address } from '~/types/index.js'
import { OpenapiUtils } from '~/utils/openapi-utils/index.js'
import { DownloadHttpFilePluginMetadata, MetadataStorage } from './constants/index.js'
import type { CacheStore } from '~/cache-store/index.js'
import type { DownloadResult } from '~/types/index.js'

interface HttpCacheEntry {
  content: string
  etag: string
  lastModified: string
}

export class DownloadHttpFilePlugin implements Plugin {
  apply(compiler: Compiler): void {
    const metadata = DownloadHttpFilePlugin.register(compiler)
    if (metadata.applied) return

    // Mark as applied immediately to prevent re-entry
    metadata.applied = true

    const cache: CacheStore = compiler.getCacheStore(DownloadHttpFilePlugin.name)

    compiler.hooks.download.tapPromise(DownloadHttpFilePlugin.name, async (address, task) => {
      const { url } = address

      if (!url.startsWith('http://') && !url.startsWith('https://')) return undefined

      const cacheKey = url
      const cached = await cache.get<HttpCacheEntry>(cacheKey)

      const headers: Record<string, string> = { ...address.headers }
      if (cached) {
        if (cached.etag) headers['If-None-Match'] = cached.etag
        if (cached.lastModified) headers['If-Modified-Since'] = cached.lastModified
      }

      const res = await this.fetch(url, headers)

      if (res.status === 304 && cached) {
        await cache.set(cacheKey, cached)
        const fingerprint = cached.etag || cached.lastModified || undefined
        return { content: cached.content, fingerprint }
      }

      if (res.status >= 400) {
        const body = await res.text().catch(() => '')
        const detail = body ? `\n  Response Body: ${body}` : ''
        throw new Error(`Unable get the openapi/swagger file from ${url}: failed with status code ${res.status}${detail}`)
      }

      const text = await res.text()
      const spec = this.deserialize(text)
      const content = JSON.stringify(spec)

      const etag = res.headers.get('etag') || ''
      const lastModified = res.headers.get('last-modified') || ''

      await cache.set<HttpCacheEntry>(cacheKey, {
        content,
        etag,
        lastModified,
      })

      const fingerprint = etag || lastModified || undefined
      return { content, fingerprint } satisfies DownloadResult
    })
  }

  private async fetch(url: string, headers: Record<string, string>): Promise<Response> {
    try {
      return await fetch(url, { headers })
    } catch (e) {
      if (e instanceof Error) {
        e.message = `Unable get the openapi/swagger file from ${url}: ${e.message}`
      }
      throw e
    }
  }

  deserialize(content: string): object {
    const json = JSON.parse(content)
    const spec = OpenapiUtils.to3_1(json)
    return spec
  }

  static register(compiler: Compiler): DownloadHttpFilePluginMetadata {
    if (!MetadataStorage.has(compiler)) {
      MetadataStorage.set(compiler, {
        applied: false,
        hooks: {
        },
      })
    }
    return MetadataStorage.get(compiler)!
  }

  static of(compiler: Compiler): DownloadHttpFilePluginMetadata | undefined {
    return this.register(compiler)
  }
}
