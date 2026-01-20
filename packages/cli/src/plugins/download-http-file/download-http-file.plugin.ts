import { Compiler } from '~/compiler/index.js'
import { Plugin, Address } from '~/types/index.js'
import { OpenapiUtils } from '~/utils/openapi-utils/index.js'


export class DownloadHttpFilePlugin implements Plugin {
  apply(compiler: Compiler): void {
    compiler.hooks.download.tapPromise(DownloadHttpFilePlugin.name, async (address, task) => {
      const { url } = address

      if (!url.startsWith('http://') && !url.startsWith('https://')) return undefined

      const content = await this.download(address)
      const spec = this.deserialize(content)
      return JSON.stringify(spec)
    })
  }

  async download(address: Address): Promise<string> {
    const { url, headers } = address

    try {
      const res = await fetch(url, { headers })
      if (res.status >= 400) throw new Error(`failed with status code ${res.status}`)

      return await res.text()
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
}
