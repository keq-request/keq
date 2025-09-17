import { OpenAPIV3 } from 'openapi-types'


export function dereference(doc: OpenAPIV3.Document, $ref: string): any {
  let value

  for (const key of $ref.split('/')) {
    if (key === '#') {
      value = doc
    } else {
      value = value[key]
    }

    if (!value) break
  }

  return value
}
