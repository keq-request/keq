import fs from 'node:fs'
import path from 'node:path'

export interface PackageJsonInfo {
  json: any
  path: string
}


export function findNearestPackageJson(startDir = process.cwd()): PackageJsonInfo | null {
  let dir = startDir
  // 向上遍历直到磁盘根目录
  while (true) {
    const pkgPath = path.join(dir, 'package.json')
    if (fs.existsSync(pkgPath)) {
      const json = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
      return { json, path: pkgPath }
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}
