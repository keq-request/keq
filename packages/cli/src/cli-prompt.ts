// import { select } from '@inquirer/prompts'
import * as R from 'ramda'
import { select } from 'inquirer-select-pro'
import { JSONPath } from 'jsonpath-plus'

import { OperationFilter } from './types/operation-filter.js'
import chalk from 'chalk'
import { OpenAPIV3 } from 'openapi-types'


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

export async function cliPrompt(modules: Record<string, OpenAPIV3.Document>, defaultValue: CliPromptDefaultValue): Promise<Pick<OperationFilter, 'method' | 'pathname'>[]> {
  const methodsInSwagger: string[] = R.uniq(JSONPath({
    path: '$..paths.*.*~',
    json: Object.values(modules),
  }))


  let methods = await selectMethods(methodsInSwagger, defaultValue.methods)
  while (methods.length === 0) {
    console.log(chalk.red('Please select at least one method'))
    methods = await selectMethods(methodsInSwagger)
  }

  const pathnamesInSwagger: string[] = R.uniq(JSONPath({
    path: `$..paths.[${methods.join(',')}]^~`,
    json: Object.values(modules),
  }))

  let pathnames = await selectPathnames(pathnamesInSwagger, defaultValue.pathnames)
  while (pathnames.length === 0) {
    console.log(chalk.red('Please select at least one pathname'))
    pathnames = await selectPathnames(pathnamesInSwagger)
  }

  return R.xprod(methods, pathnames)
    .map(([method, pathname]): Pick<OperationFilter, 'method' | 'pathname'> => R.reject(R.isNil, {
      method,
      pathname,
    }))
}
