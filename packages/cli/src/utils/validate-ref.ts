import { JSONPath } from 'jsonpath-plus'
import { OpenAPIV3 } from 'openapi-types'
import * as R from 'ramda'
import { getRefs } from './get-refs.js'


export function validateRef(document: OpenAPIV3.Document): boolean {
  const refs: string[] = getRefs(document)
  const $refs: string[] = JSONPath({
    path: "$..*['$ref']",
    json: document.paths,
  })

  const unknownRefs = R.difference($refs, refs)
  if (unknownRefs.length) {
    throw new Error(`Cannot find $ref: ${unknownRefs.join(', ')}`)
  }

  return $refs.every((ref) => refs.includes(ref))
}
