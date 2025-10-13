import fs from 'fs-extra'
import { RuntimeConfig } from '~/types/runtime-config'


export class Debugger {
  constructor(private rc?: RuntimeConfig) {
  }

  writeSwagger(fullpath: string, swagger: any): void {
    if (this.rc?.debug) {
      void fs.writeJSON(fullpath, swagger, { spaces: 2 })
    }
  }
}
