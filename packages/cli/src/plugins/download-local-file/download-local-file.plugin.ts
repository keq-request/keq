import * as path from 'path'
import * as fs from 'fs/promises'
import * as yaml from 'js-yaml'
import { Compiler } from '~/compiler/index.js'
import { Plugin } from '~/types/index.js'
import { OpenapiUtils } from '~/utils/openapi-utils/index.js'
import { fileURLToPath } from 'url'
import { DownloadLocalFilePluginMetadata, MetadataStorage } from './constants/index.js'
import type { CacheStore } from '~/cache-store/index.js'
import type { DownloadResult } from '~/types/index.js'

interface LocalFileCacheEntry {
  content: string
  mtimeMs: number
}

export class DownloadLocalFilePlugin implements Plugin {
  apply(compiler: Compiler): void {
    const metadata = DownloadLocalFilePlugin.register(compiler)
    if (metadata.applied) return

    // Mark as applied immediately to prevent re-entry
    metadata.applied = true

    const cache: CacheStore = compiler.getCacheStore(DownloadLocalFilePlugin.name)

    compiler.hooks.download.tapPromise(DownloadLocalFilePlugin.name, async (address, task) => {
      const { url, encoding } = address
      if (!url.startsWith('file://')) return undefined
      const filepath = fileURLToPath(url)

      const stat = await fs.stat(filepath)
      const fingerprint = `${filepath}:${stat.mtimeMs}`
      const cacheKey = filepath
      const cached = await cache.get<LocalFileCacheEntry>(cacheKey)

      if (cached && cached.mtimeMs === stat.mtimeMs) {
        return { content: cached.content, fingerprint } satisfies DownloadResult
      }

      const fileExt = path.extname(filepath)
      const rawContent = await fs.readFile(filepath, encoding)
      const str = typeof rawContent === 'string' ? rawContent : rawContent.toString(encoding)

      let content: string | undefined
      if (['.yml', '.yaml'].includes(fileExt)) {
        const value = yaml.load(str)
        content = JSON.stringify(OpenapiUtils.to3_1(value))
      } else if (fileExt === '.json') {
        content = JSON.stringify(OpenapiUtils.to3_1(JSON.parse(str)))
      }

      if (content) {
        await cache.set<LocalFileCacheEntry>(cacheKey, {
          content,
          mtimeMs: stat.mtimeMs,
        })
        return { content, fingerprint } satisfies DownloadResult
      }

      return undefined
    })
  }

  static register(compiler: Compiler): DownloadLocalFilePluginMetadata {
    if (!MetadataStorage.has(compiler)) {
      MetadataStorage.set(compiler, {
        applied: false,
        hooks: {
        },
      })
    }
    return MetadataStorage.get(compiler)!
  }

  static of(compiler: Compiler): DownloadLocalFilePluginMetadata | undefined {
    return this.register(compiler)
  }
}
