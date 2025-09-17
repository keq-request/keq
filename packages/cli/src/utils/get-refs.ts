import { OpenAPIV3 } from 'openapi-types'

export function getRefs(document: OpenAPIV3.Document): string[] {
  const refs: string[] = []

  if (document.components) {
    for (const [groupName, group] of Object.entries(document.components)) {
      for (const schemaName of Object.keys(group)) {
        const schemaRef = `#/components/${groupName}/${schemaName}`
        refs.push(schemaRef)
      }
    }
  }

  return refs
}
