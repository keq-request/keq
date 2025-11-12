import { PackageJsonInfo } from './find-nearest-package-json.js'

type ModuleSystem = 'esm' | 'cjs'

export function getProjectModuleSystem(pkgInfo: PackageJsonInfo): ModuleSystem {
  if (!pkgInfo?.json) return 'cjs'
  const { json } = pkgInfo

  if (json.type === 'module') return 'esm'
  return 'cjs'
}
