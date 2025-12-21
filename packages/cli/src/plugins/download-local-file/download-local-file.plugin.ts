import * as path from 'path'
import * as fs from 'fs/promises'
import * as yaml from 'js-yaml'
import { Compiler } from '~/compiler/index.js'
import { Plugin } from '~/types/index.js'


export class DownloadLocalFilePlugin implements Plugin {
  apply(compiler: Compiler): void {
    compiler.hooks.download.tapPromise(DownloadLocalFilePlugin.name, async (address, task) => {
      if (!address.startsWith('./') && !address.startsWith('/') && !address.startsWith('../')) return undefined

      const fileExt = path.extname(address)
      const content = await fs.readFile(address, 'utf8')

      if (['.yml', '.yaml'].includes(fileExt)) {
        return JSON.stringify(yaml.load(content))
      } else if (fileExt === '.json') {
        return content
      }
    })
  }
}
