import * as R from 'ramda'
import { select } from 'inquirer-select-pro'
import { JSONPath } from 'jsonpath-plus'
import { OperationFilter } from '../../types/operation-filter.js'
import { ApiDocumentV3_1 } from './api-document_v3_1.js'
import { logger } from '~/utils/logger.js'


async function selectMethods(methodsInSwagger: string[], defaultValue?: string[]): Promise<string[]> {
  return await select({
    message: 'Select Method',
    defaultValue: defaultValue || [],
    options: (input) => {
      const items = [
        { name: 'Get', value: 'get' },
        { name: 'Post', value: 'post' },
        { name: 'Put', value: 'put' },
        { name: 'Delete', value: 'delete' },
        { name: 'Patch', value: 'patch' },
        { name: 'Head', value: 'head' },
        { name: 'Option', value: 'option' },
      ].filter((method) => methodsInSwagger.includes(method.value))

      if (!input) return items
      const q = input.trim().toLowerCase()

      return items.filter((method) => method.name.toLowerCase().includes(q))
    },
  })
}

async function selectPathnames(pathnames: string[], defaultValue?: string[]): Promise<string[]> {
  return await select({
    message: 'Select Pathname',
    defaultValue: defaultValue || [],
    options: (input) => {
      const items = pathnames.map((pathname) => ({ name: pathname, value: pathname }))

      if (!input) return items
      const q = input.trim().toLowerCase()

      return items.filter((p) => p.name.toLowerCase().includes(q))
    },
  })
}

interface CliPromptDefaultValue {
  methods: string[]
  pathnames: string[]
}

export async function cliPrompt(documents: ApiDocumentV3_1[], defaultValue: CliPromptDefaultValue): Promise<Pick<OperationFilter, 'method' | 'pathname'>[]> {
  const methodsInSwagger: string[] = R.uniq(JSONPath({
    path: '$..paths.*.*~',
    json: R.pluck('swagger', documents),
  }))


  let methods = await selectMethods(methodsInSwagger, defaultValue.methods)
  while (methods.length === 0) {
    logger.error('Please select at least one method')
    methods = await selectMethods(methodsInSwagger)
  }

  const pathnamesInSwagger: string[] = R.uniq(JSONPath({
    path: `$..paths.[${methods.join(',')}]^~`,
    json: R.pluck('swagger', documents),
  }))

  let pathnames = await selectPathnames(pathnamesInSwagger, defaultValue.pathnames)
  while (pathnames.length === 0) {
    logger.error('Please select at least one pathname')
    pathnames = await selectPathnames(pathnamesInSwagger)
  }

  return R.xprod(methods, pathnames)
    .map(([method, pathname]): Pick<OperationFilter, 'method' | 'pathname'> => R.reject(R.isNil, {
      method,
      pathname,
    }))
}
