import { OpenAPIV3 } from 'openapi-types'
import { isKeywords } from './is-keywords.js'
import { isReservedWord } from './is-reserved-word.js'


/**
 * * Avoid naming duplicates with javascript keywords and reserved words
 */
export function getSafeOperationName(pathname: string, method: string, operation: OpenAPIV3.OperationObject): string {
  const operationId = operation.operationId
  if (
    operationId &&
    operationId !== 'index' &&
    !isKeywords(operationId) &&
    !isReservedWord(operationId)
  ) {
    return operationId
  }

  return `${method}_${pathname}`
    .replace(/\//g, '_')
    .replace(/-/g, '_')
    .replace(/:/g, '$$')
    .replace(/{(.+)}/, '$$$1')
}
