import * as path from 'path'
import * as fs from 'fs/promises'
import * as yaml from 'js-yaml'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { Compiler } from '~/compiler/index.js'
import { Plugin } from '~/types/index.js'
import { OpenapiUtils } from '~/utils/openapi-utils/index.js'
import { DownloadByShPluginMetadata, MetadataStorage } from './constants/index.js'
import type { CacheStore } from '~/cache-store/index.js'
import type { DownloadResult } from '~/types/index.js'

const execFileAsync = promisify(execFile)

const DEFAULT_TIMEOUT_MS = 30_000
const DEFAULT_MAX_BUFFER = 50 * 1024 * 1024

interface ShellCacheEntry {
  content: string
  mtimeMs: number
}

export class DownloadByShPlugin implements Plugin {
  apply(compiler: Compiler): void {
    const metadata = DownloadByShPlugin.register(compiler)
    if (metadata.applied) return

    metadata.applied = true

    const cache: CacheStore = compiler.getCacheStore(DownloadByShPlugin.name)

    compiler.hooks.download.tapPromise(DownloadByShPlugin.name, async (address) => {
      const { url } = address
      if (!url.startsWith('sh://')) return undefined

      const rawPath = url.slice('sh://'.length)
      const filepath = path.resolve(compiler.context.workdir ?? process.cwd(), rawPath)

      const stat = await fs.stat(filepath).catch(() => undefined)
      if (!stat) {
        throw new Error(`DownloadByShPlugin: script not found: ${filepath}`)
      }

      const fingerprint = `${filepath}:${stat.mtimeMs}`
      const cacheKey = filepath
      const cached = await cache.get<ShellCacheEntry>(cacheKey)

      if (cached && cached.mtimeMs === stat.mtimeMs) {
        return { content: cached.content, fingerprint } satisfies DownloadResult
      }

      const { stdout, stderr } = await execFileAsync('/bin/sh', [filepath], {
        timeout: DEFAULT_TIMEOUT_MS,
        maxBuffer: DEFAULT_MAX_BUFFER,
        cwd: compiler.context.workdir,
      })

      const output = stdout.trim()
      if (!output) {
        const detail = stderr ? `\n  stderr: ${stderr}` : ''
        throw new Error(`DownloadByShPlugin: script produced no output: ${filepath}${detail}`)
      }

      const content = this.parseOutput(output, filepath)

      await cache.set<ShellCacheEntry>(cacheKey, {
        content,
        mtimeMs: stat.mtimeMs,
      })

      return { content, fingerprint } satisfies DownloadResult
    })
  }

  private parseOutput(output: string, filepath: string): string {
    try {
      return JSON.stringify(OpenapiUtils.to3_1(JSON.parse(output)))
    } catch { /* not JSON */ }

    try {
      const value = yaml.load(output)
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(OpenapiUtils.to3_1(value))
      }
    } catch { /* not YAML */ }

    throw new Error(
      `DownloadByShPlugin: script output is neither valid JSON nor YAML: ${filepath}`,
    )
  }

  static register(compiler: Compiler): DownloadByShPluginMetadata {
    if (!MetadataStorage.has(compiler)) {
      MetadataStorage.set(compiler, {
        applied: false,
        hooks: {},
      })
    }
    return MetadataStorage.get(compiler)!
  }

  static of(compiler: Compiler): DownloadByShPluginMetadata | undefined {
    return this.register(compiler)
  }
}
