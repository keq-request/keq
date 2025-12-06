import fs from 'fs-extra'
import { RuntimeConfig } from '~/types/runtime-config.js'


export class Debugger {
  constructor(private rc?: RuntimeConfig) {
  }

  writeOpenapi(fullpath: string, openapi: any): void {
    if (this.rc?.debug) {
      void fs.writeJSON(fullpath, openapi, { spaces: 2 })
    }
  }
}
