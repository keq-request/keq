import { SchemaDefinition } from '~/tasks/utils/schema-definition.js'
import { isNonArraySchemaObject } from '../utils/is-non-array-schema-object.js'
import { generateComment, generateSchema } from '../utils/generate-schema.js'


export async function jsonSchemaRenderer(schemaDefinition: SchemaDefinition): Promise<string> {
  let $comment = generateComment(schemaDefinition.schema)
  if ($comment) $comment += '\n'

  if (typeof schemaDefinition.schema === 'boolean') {
    return `${$comment}type ${schemaDefinition.name} = unknown`
  }

  if (isNonArraySchemaObject(schemaDefinition.schema) && schemaDefinition.schema.type === 'object') {
    return `${$comment}export interface ${schemaDefinition.name} ${generateSchema(schemaDefinition.schema)}`
  }

  return `${$comment}export type ${schemaDefinition.name} = ${generateSchema(schemaDefinition.schema)}`
}
