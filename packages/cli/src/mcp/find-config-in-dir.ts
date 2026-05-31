import path from 'path'
import fs from 'fs-extra'

const CONFIG_FILENAMES = [
  '.keqrc',
  '.keqrc.ts',
  '.keqrc.js',
  '.keqrc.mjs',
  '.keqrc.cjs',
  '.keqrc.json',
  '.keqrc.yml',
  '.keqrc.yaml',
  'keq.config.ts',
  'keq.config.js',
  'keq.config.mjs',
  'keq.config.cjs',
  'keq.config.json',
  'keq.config.yml',
  'keq.config.yaml',
]

export async function findConfigInDir(dir: string): Promise<string | null> {
  for (const filename of CONFIG_FILENAMES) {
    const filePath = path.resolve(dir, filename)
    if (await fs.pathExists(filePath)) {
      return filePath
    }
  }
  return null
}
