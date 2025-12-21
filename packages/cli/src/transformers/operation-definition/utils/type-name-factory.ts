import * as changeCase from 'change-case'
import { OperationDefinition } from '~/models/index.js'

export type TypeNameFn = (name: string) => string

export function typeNameFactory(operationDefinition: OperationDefinition): TypeNameFn {
  const pascalCaseOperationId = changeCase.pascalCase(operationDefinition.operationId)
  return (name: string) => `${pascalCaseOperationId}${name}`
}
