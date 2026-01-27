import * as path from 'path'
import * as fs from 'fs/promises'
import * as yaml from 'js-yaml'
import { Compiler } from '~/compiler/index.js'
import { Plugin } from '~/types/index.js'
import { OpenapiUtils } from '~/utils/openapi-utils/index.js'
import { fileURLToPath } from 'url'
import { DownloadLocalFilePluginMetadata, MetadataStorage } from './constants/index.js'


export class DownloadLocalFilePlugin implements Plugin {
  apply(compiler: Compiler): void {
    const metadata = DownloadLocalFilePlugin.register(compiler)
    if (metadata.applied) return

    // Mark as applied immediately to prevent re-entry
    metadata.applied = true

    compiler.hooks.download.tapPromise(DownloadLocalFilePlugin.name, async (address, task) => {
      const { url, encoding } = address
      if (!url.startsWith('file://')) return undefined
      const filepath = fileURLToPath(url)

      const fileExt = path.extname(filepath)
      const content = await fs.readFile(filepath, encoding)
      const str = typeof content === 'string' ? content : content.toString(encoding)

      if (['.yml', '.yaml'].includes(fileExt)) {
        const value = yaml.load(str)
        return JSON.stringify(OpenapiUtils.to3_1(value))
      } else if (fileExt === '.json') {
        return JSON.stringify(OpenapiUtils.to3_1(JSON.parse(str)))
      }
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
