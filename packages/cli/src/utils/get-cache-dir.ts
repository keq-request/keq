import path from 'path'
import os from 'os'
import { createHash } from 'crypto'

const APP_NAME = 'keq-request'
const SUB_DIR = 'cli'

function getBaseCacheDir(): string {
  const platform = process.platform

  if (platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Caches', APP_NAME, SUB_DIR)
  }

  if (platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local')
    return path.join(localAppData, APP_NAME, SUB_DIR, 'Cache')
  }

  const xdgCache = process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache')
  return path.join(xdgCache, APP_NAME, SUB_DIR)
}

function hashProjectPath(projectDir: string): string {
  return createHash('sha256')
    .update(projectDir)
    .digest('hex')
    .slice(0, 16)
}

export function getCacheDir(projectDir: string): string {
  return path.join(getBaseCacheDir(), hashProjectPath(projectDir))
}

export function getAllCacheDir(): string {
  return getBaseCacheDir()
}
