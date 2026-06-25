import * as fs from 'fs-extra'
import * as yaml from 'js-yaml'
import { request } from 'keq'
import { OpenAPI, OpenAPIV3 } from 'openapi-types'
import * as path from 'path'
import * as validUrl from 'valid-url'
import chalk from 'chalk'
import { disinfect } from './disinfect.js'
import { RuntimeConfig } from '~/types/runtime-config.js'

async function fetchFromUrl(url: string): Promise<OpenAPIV3.Document> {
  let content: string
  try {
    const res = await request
      .get(url)
      .resolveWith('response')

    if (res.status >= 400) throw new Error(`Request failed with status code ${res.status}`)

    content = await res.text()
  } catch (e) {
    if (e instanceof Error) {
      e.message = `Unable get the swagger file from ${url}: ${e.message}`
    }

    throw e
  }


  try {
    return JSON.parse(content) as OpenAPIV3.Document
  } catch (e) {
    throw new Error(`The swagger file get from url isn't json: ${url}`)
  }
}


export async function fetchOpenapiFile(filepath: string): Promise<OpenAPI.Document> {
  let swagger: OpenAPIV3.Document
  if (validUrl.isUri(filepath)) {
    swagger = await fetchFromUrl(filepath)
  } else {
    const fileExt = path.extname(filepath)
    const content = await fs.readFile(filepath, 'utf8')

    if (['.yml', '.yaml'].includes(fileExt)) {
      swagger = yaml.load(content) as OpenAPIV3.Document
    } else if (fileExt === '.json') {
      swagger = JSON.parse(content) as OpenAPIV3.Document
    } else {
      throw new Error(`File ${fileExt} not support.`)
    }
  }

  return swagger
}

export async function fetchModules(rc: RuntimeConfig): Promise<Record<string, OpenAPIV3.Document>> {
  const promises = Object.entries(rc.modules)
    .map(async ([moduleName, filepath]) => {
      const swagger = await fetchOpenapiFile(filepath)
      const swagger3 = await disinfect(moduleName, swagger)

      return [moduleName, swagger3] as const
    })


  const results = await Promise.allSettled(promises)


  const modulesMap: Record<string, OpenAPIV3.Document> = {}

  for (const result of results) {
    if (result.status === 'rejected') {
      console.log(chalk.red(String(result.reason.message)))
    } else {
      const [moduleName, swagger] = result.value
      modulesMap[moduleName] = swagger

      if (rc.debug) {
        await fs.writeJSON(`.keq/${moduleName}.swagger.json`, swagger, { spaces: 2 })
      }
    }
  }

  return modulesMap
}
