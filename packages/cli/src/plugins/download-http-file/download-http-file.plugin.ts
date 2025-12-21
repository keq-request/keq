import * as validUrl from 'valid-url'
import { Compiler } from '~/compiler/index.js'
import { Plugin } from '~/types/plugin.js'


export class DownloadHttpFilePlugin implements Plugin {
  apply(compiler: Compiler): void {
    compiler.hooks.download.tapPromise(DownloadHttpFilePlugin.name, async (address, task) => {
      if (!validUrl.isUri(address)) return undefined
      return this.download(address)
    })
  }

  async download(address): Promise<string> {
    try {
      const res = await fetch(address)
      if (res.status >= 400) throw new Error(`failed with status code ${res.status}`)

      return await res.text()
    } catch (e) {
      if (e instanceof Error) {
        e.message = `Unable get the openapi/swagger file from ${address}: ${e.message}`
      }

      throw e
    }
  }
}
