import chalk from 'chalk'
import * as changeCase from 'change-case'
import * as fs from 'fs-extra'
import pMap from 'p-map'
import * as path from 'path'
import * as R from 'ramda'
import { getSafeOperationName } from './utils/get-safe-operation-name.js'
import jsonSchemaTemplateStr from './templates/json-schema/file.hbs'
import operationTemplateStr from './templates/openapi-core/operation.hbs'
import typeTemplateStr from './templates/openapi-core/type.hbs'

import Handlebars from 'handlebars'
import './handlebar/register-helper.js'
import './handlebar/register-partial.js'
import { CompileResult } from './types/compile-result.js'
import { CompileOpenapiOptions } from './types/compile-openapi-options.js'
import { FileNamingStyle } from './types/file-naming-style.js'
import { SupportedMethods } from './constants/supported-methods.js'


const readAndCompileTemplate = (tpl: string): ReturnType<typeof Handlebars.compile> => Handlebars.compile(tpl)
const templates = {
  t_schema: readAndCompileTemplate(jsonSchemaTemplateStr),
  t_operation: readAndCompileTemplate(operationTemplateStr),
  t_type: readAndCompileTemplate(typeTemplateStr),
}


function getModuleOutput(options: CompileOpenapiOptions): string {
  const moduleName = options.moduleName
  const fileNamingStyle: FileNamingStyle = options?.fileNamingStyle || FileNamingStyle.snakeCase
  const formatFilename = changeCase[fileNamingStyle]
  const outdir = options?.outdir || `${process.cwd()}/api`
  return path.join(outdir, formatFilename(moduleName))
}

export async function compile(options: CompileOpenapiOptions): Promise<CompileResult[]> {
  const esm = !!options.esm
  const moduleName = options.moduleName
  const document = options.document
  const fileNamingStyle: FileNamingStyle = options?.fileNamingStyle || FileNamingStyle.snakeCase
  const formatFilename = changeCase[fileNamingStyle]
  const output = getModuleOutput(options)
  const keq = options?.request ? path.relative(output, options.request) : 'keq'

  // const ignoredOperations: string[] = []
  const results: CompileResult[] = []
  if (document.components?.schemas && !R.isEmpty(document.components.schemas)) {
    for (const [name, jsonSchema] of R.toPairs(document.components.schemas)) {
      const context = {
        name,

        jsonSchema,
        document,

        esm,
        fileNamingStyle,
        keq,
      }

      const fileContent = templates.t_schema(context)
      let filename = formatFilename(name)
      filename = filename === 'index' ? 'index.schema' : filename
      const filepath = path.join(output, 'components', 'schemas', `${filename}.ts`)

      results.push({
        name: filename,
        path: filepath,
        content: fileContent,
      })
    }
  }

  if (document.paths && !R.isEmpty(document.paths)) {
    for (const [pathname, pathItem] of Object.entries(document.paths)) {
      if (!pathItem) continue

      for (const [m, operation] of Object.entries(pathItem)) {
        const method = m.toLowerCase()
        if (!SupportedMethods.includes(method)) {
          console.warn(chalk.yellow(`Method ${String(method).toUpperCase()} on path ${String(pathname)} cannot compiled, skipping`))
          continue
        }

        if (typeof operation === 'object' && !Array.isArray(operation)) {
          const context = {
            pathname,
            method,
            operation,

            document,
            moduleName,

            fileNamingStyle,
            esm,
            keq,
          }

          const filename = formatFilename(getSafeOperationName(pathname, method, operation))
          const operationFilepath = path.join(output, `${filename}.ts`)
          const operationTypeFilepath = path.join(output, 'types', `${filename}.ts`)

          const operationFileContent = templates.t_operation({ ...context })
          const operationTypeFileContent = templates.t_type({ ...context })


          // operation type file
          results.push({
            name: filename,
            path: operationTypeFilepath,
            content: operationTypeFileContent,
          })

          // operation file
          results.push({
            name: filename,
            path: operationFilepath,
            content: operationFileContent,
          })
        } else {
          console.warn(chalk.yellow(`Operation ${String(method)} on path ${String(pathname)} cannot compiled, skipping`))
        }
      }
    }
  }

  return results
}


async function genIndexFile(dir: string, options: CompileOpenapiOptions): Promise<void> {
  const names = await fs.readdir(dir)

  const pairs = await Promise.all(names.map(async (name) => [name, await fs.stat(path.join(dir, name))] as const))

  const filenames = pairs
    .filter(([name, fileStat]) => fileStat.isFile() && name.endsWith('.ts') && name !== 'index.ts')
    .map(([filename]) => filename)

  const content = filenames
    .map((filename) => `export * from "./${filename.slice(0, -3)}${options.esm ? '.js' : ''}"`)
    .join('\n')

  await fs.writeFile(path.join(dir, 'index.ts'), content)
}


export async function CompileOpenapi(option: CompileOpenapiOptions): Promise<void> {
  const results = await compile(option)

  await pMap(
    results,
    async (result) => {
      await fs.ensureFile(result.path)
      await fs.writeFile(result.path, result.content)
    },
    { concurrency: 10 },
  )

  const output = getModuleOutput(option)
  await genIndexFile(output, option)
  await genIndexFile(path.join(output, 'components', 'schemas'), option)
}
