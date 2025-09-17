import * as R from 'ramda'
import * as path from 'path'
import * as fs from 'fs-extra'
import * as changeCase from 'change-case'
import { OpenAPIV3 } from 'openapi-types'
import { RuntimeConfig } from '~/types/runtime-config.js'
import { getSafeOperationName } from './get-safe-operation-name.js'
import { OperationFilter } from '~/types/operation-filter.js'
import chalk from 'chalk'
import { SupportedMethods } from '~/constants/supported-methods.js'
import { openapiShakingSync } from '@opendoc/openapi-shaking'


function operationExists(rc: RuntimeConfig, moduleName: string, pathname: string, method: string, operation: OpenAPIV3.OperationObject): boolean {
  const formatFilename = changeCase[rc.fileNamingStyle]
  const output = path.join(rc.outdir, formatFilename(moduleName))
  const filename = formatFilename(getSafeOperationName(pathname, method, operation))
  const filepath = path.join(output, `${filename}.ts`)
  // TODO: 使用 fs.exists 代替 fs.existsSync 提升性能
  return fs.existsSync(filepath)
}

export async function sharkingModules(modules: Record<string, OpenAPIV3.Document>, filters: OperationFilter[], rc: RuntimeConfig): Promise<Record<string, OpenAPIV3.Document>> {
  const isOperationIgnored = (moduleName: string, pathname: string, method: string, operation: OpenAPIV3.OperationObject): boolean => {
    if (!filters.length) return false

    const existed = operationExists(rc, moduleName, pathname, method, operation)

    return filters.every((f) => {
      if (f.method && method !== f.method.toLowerCase().trim()) return true
      if (f.pathname && pathname !== f.pathname.trim()) return true
      if (!f.append && !existed) return true
      if (!f.update && existed) return true

      return false
    })
  }

  const sharkedModules = R.mapObjIndexed(
    (m, mName) => openapiShakingSync(m, (pathname, method, operation) => {
      if (!SupportedMethods.includes(method)) return false
      if (isOperationIgnored(mName, pathname, method, operation)) return false
      return true
    }, { tolerant: rc.tolerant }),
    modules,
  )

  const result: Record<string, OpenAPIV3.Document> = {}

  for (const mName in sharkedModules) {
    if (R.isEmpty(sharkedModules[mName].paths)) {
      console.log(chalk.yellow(`${mName} module skipped.`))
      continue
    }

    result[mName] = sharkedModules[mName]
  }

  return result
}
