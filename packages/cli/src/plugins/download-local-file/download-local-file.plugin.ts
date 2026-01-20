import * as path from 'path'
import * as fs from 'fs/promises'
import * as yaml from 'js-yaml'
import { Compiler } from '~/compiler/index.js'
import { Plugin } from '~/types/index.js'
import { OpenapiUtils } from '~/utils/openapi-utils/index.js'
import { fileURLToPath } from 'url'


export class DownloadLocalFilePlugin implements Plugin {
  apply(compiler: Compiler): void {
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
}
