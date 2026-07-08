import path from 'path'
import fs from 'fs-extra'
import { CONFIG_FILENAMES } from '~/constants/index.js'

export async function findConfigInDir(dir: string): Promise<string | null> {
  for (const filename of CONFIG_FILENAMES) {
    const filePath = path.resolve(dir, filename)
    if (await fs.pathExists(filePath)) {
      return filePath
    }
  }
  return null
}
